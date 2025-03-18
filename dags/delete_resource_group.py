from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from dotenv import load_dotenv
from urllib.parse import urlparse
import os
import pika
import shutil
 
# Load environment variables from .env file
load_dotenv('/opt/airflow/dags/.env')
 
# Default args for DAG
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2025, 1, 19),
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}
 
# Global Variables
listener_initialized = False
received_message = None
 
def rabbitmq_consumer():
    """
    Consumes a message from RabbitMQ containing the project_id.
    """
    global listener_initialized, received_message
 
    # Load environment variables
    load_dotenv('/opt/airflow/dags/.env')
 
    if listener_initialized:
        print("Listener is already running.")
        return
 
    connection = None
    channel = None
 
    try:
        listener_initialized = True
        rabbit_url = os.getenv("RABBITMQ_URL")
       
        if not rabbit_url:
            raise Exception("RABBITMQ_URL is not set")
       
        parsed_url = urlparse(rabbit_url)
        rabbit_host = parsed_url.hostname
        rabbit_port = parsed_url.port
       
        if not rabbit_host:
            raise Exception("RabbitMQ hostname could not be resolved")
       
        credentials = None
        if parsed_url.username and parsed_url.password:
            credentials = pika.PlainCredentials(parsed_url.username, parsed_url.password)
 
        parameters = pika.ConnectionParameters(
            host=rabbit_host,
            port=rabbit_port,
            credentials=credentials
        )
       
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
 
        queue_name = "delete-vm"
        # Get queue info
        queue_info = channel.queue_declare(queue=queue_name, durable=True, exclusive=False, auto_delete=False)
        message_count = queue_info.method.message_count
        print(f"Queue {queue_name} has {message_count} messages")
 
        def callback(ch, method, properties, body):
            try:
                global received_message
                received_message = body.decode()
                print(f" [x] Received {received_message}")
               
                # Acknowledge the message
                ch.basic_ack(delivery_tag=method.delivery_tag)
 
                # Stop consuming after receiving the message
                ch.stop_consuming()
               
            except Exception as e:
                print(f"Error processing message: {e}")
 
        # Configure consumer
        channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback,
            auto_ack=False
        )
 
        print(f"Listening for messages in queue: {queue_name}")
       
        # Start consuming with a timeout
        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            channel.stop_consuming()
 
        channel.queue_delete(queue=queue_name)
    except Exception as error:
        print("Error in listener:", error)
        raise
 
    finally:
        listener_initialized = False
        if channel and not channel.is_closed:
            channel.close()
        if connection and not connection.is_closed:
            connection.close()
        print("Listener stopped.")
       
        return received_message if received_message is not None else None
   
# def create_terraform_directory(project_id):
#     """
#     Creates a unique Terraform directory for the project.
#     """
#     directory_path = f"/opt/airflow/dags/terraform/{project_id}"
#     os.makedirs(directory_path, exist_ok=True)
#     return directory_path
 
def cleanup_directory(project_id):
    """
    Cleans up the Terraform directory after execution.
    """
    directory_path = f"/opt/airflow/dags/terraform/{project_id}"
    if os.path.exists(directory_path):
        shutil.rmtree(directory_path)
 
# Define DAG
with DAG(
    dag_id='delete_resource_group',
    default_args=default_args,
    schedule=None,
    catchup=False,
    max_active_runs=1,
) as dag:
   
    # Task to consume a message from RabbitMQ
    consume_rabbitmq = PythonOperator(
        task_id='rabbitmq_consumer',
        python_callable=rabbitmq_consumer,
        provide_context=True,
    )
 
    # # Task to create Terraform directory
    # create_directory = PythonOperator(
    #     task_id='create_directory',
    #     python_callable=create_terraform_directory,
    #     op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') }}"],  # Use project_id from RabbitMQ
    # )
 
    # Task to run `terraform destroy`
    terraform_destroy = BashOperator(
        task_id='terraform_destroy',
        bash_command='terraform init && terraform destroy -auto-approve',
        cwd="/opt/airflow/dags/terraform/{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}",  # Use project_id from RabbitMQ
        # op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') }}"],
        # cwd="{{ ti.xcom_pull(task_ids='create_directory') }}",  # Use the Terraform directory created earlier
        env={
            "ARM_SUBSCRIPTION_ID": os.getenv("AZURE_SUBSCRIPTION_ID"),
            "ARM_CLIENT_ID": os.getenv("AZURE_CLIENT_ID"),
            "ARM_CLIENT_SECRET": os.getenv("AZURE_CLIENT_SECRET"),
            "ARM_TENANT_ID": os.getenv("AZURE_TENANT_ID"),
        },
        retries=3,
        retry_delay=timedelta(minutes=5),
        do_xcom_push=True
    )
 
    # Task to clean up the Terraform directory
    cleanup_task = PythonOperator(
        task_id='cleanup_directory',
        python_callable=cleanup_directory,
        op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}"],
    )
 
    # Define task dependencies
    consume_rabbitmq >> terraform_destroy >> cleanup_task