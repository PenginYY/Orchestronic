from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.json_util import dumps
import pika
from urllib.parse import urlparse
import os
import json
import socketio
import time
from bson.objectid import ObjectId

# Load environment variables
load_dotenv('/opt/airflow/dags/.env')

# Global Variables
listener_initialized = False
received_message = None
 
def rabbitmq_consumer():
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
 
        queue_name = "create-vm"
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
        
        return received_message if received_message is not None else "67cf664cd062ae3b148d5f13"

def fetch_from_mongo(received_message):
    print(f"Received message from XCom: {received_message}")
    project_id = received_message
        
    try:
        load_dotenv('/opt/airflow/dags/.env')
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise Exception("MONGODB_URI is not set")

        client = MongoClient(uri)
        database = client["test"]
        collection = database["resources"]

        data = list(collection.find({"projectid": project_id}))
        print("Fetched data:", data)

    except Exception as e:
        raise Exception(f"The following error occurred: {str(e)}")
    
    finally:
        client.close()

    return dumps(data)

def send_vm_notification(project_id):
    sio = socketio.Client()

    # Fetch Project data
    try:
        load_dotenv('/opt/airflow/dags/.env')
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise Exception("MONGODB_URI is not set")

        client = MongoClient(uri)
        database = client["test"]
        collection = database["projects"]

        data = list(collection.find({ "_id": ObjectId(project_id)}))
        print("Fetched data:", data)

        if(data):
            # Send notification
            project = data[0]
            try:
                sio.connect("http://host.docker.internal:4000")
                if sio.connected:
                    sio.emit('notification', {'projectName': project["projectName"],
                                            'message': 'Virtual machine is being created now',
                                            'userId': project["userId"]})
                    time.sleep(2)
                    sio.disconnect()
                    return "Notification sent successfully"
                else:
                    return "Failed to establish a Socket.IO connection"

            except Exception as e:
                return f"Failed to send notification: {str(e)}"

    except Exception as e:
        raise Exception(f"The following error occurred: {str(e)}")
    
    finally:
        client.close()

def create_terraform_directory(project_id):
    """
    Creates a Terraform directory for a specific project.
    """
    print(f"Creating Terraform directory for project: {project_id}")
    terraform_dir = f"/opt/airflow/dags/terraform/{project_id}"
    os.makedirs(terraform_dir, exist_ok=True)
    print(f"Created Terraform directory: {terraform_dir}")
    return terraform_dir

def generate_tfvars(resources):
    """
    Generate the terraform.auto.tfvars file from the fetched resources.
    """
    
    resources = json.loads(resources)
    
    vm_resources = []
    storage_resources = []
    database_resources = []

    project_id = resources[0]["projectid"]
    project_location = resources[0]["region"]
    
    for resource in resources:
        if resource["type"] == "Virtual Machine":
            vm_resources.append({
                "name": resource["vmname"],
                "size": resource["vmsize"],
                "os_image": resource["os"],
                "username": resource["username"],
                "password": resource["password"]
            })
        elif resource["type"] == "Storage":
            storage_resources.append({
                "name": resource["name"]
            })
        elif resource["type"] == "Database":
            database_resources.append({
                "name": resource["name"],
                "username": resource["username"],
                "password": resource["password"]
            })

    tfvars_content = f'''
project_id = "{project_id}"
project_location = "{project_location}"

vm_resources = {json.dumps(vm_resources, indent=4)}
storage_resources = {json.dumps(storage_resources, indent=4)}
database_resources = {json.dumps(database_resources, indent=4)}
'''

    # Ensure the Terraform directory exists
    terraform_dir = f"/opt/airflow/dags/terraform/{project_id}"
    os.makedirs(terraform_dir, exist_ok=True)

    # Write the terraform.auto.tfvars file
    try:
        with open(f"{terraform_dir}/terraform.auto.tfvars", "w") as tf_file:
            tf_file.write(tfvars_content)
        print("terraform.auto.tfvars file generated successfully.")
    except Exception as e:
        print(f"Error writing terraform.auto.tfvars file: {e}")
        raise

def generate_main_tf(project_id):
    """
    Generate the main.tf file for Terraform.
    """
    main_tf_content = f'''
terraform {{
  required_providers {{
    azurerm = {{
      source  = "hashicorp/azurerm"
      version = "~> 3.0"  # Pin the provider version
    }}
  }}
}}

provider "azurerm" {{
  features {{
    resource_group {{
      prevent_deletion_if_contains_resources = false
    }}
  }}
}}

resource "azurerm_resource_group" "project_rg" {{
    name     = "rg-{project_id}"
    location = var.project_location
}}

# Virtual Network
resource "azurerm_virtual_network" "project_vnet" {{
    name                = "${{var.project_id}}-vnet"
    location            = azurerm_resource_group.project_rg.location
    resource_group_name = azurerm_resource_group.project_rg.name
    address_space       = ["10.0.0.0/16"]
}}

# Subnet
resource "azurerm_subnet" "project_subnet" {{
    name                 = "${{var.project_id}}-subnet"
    resource_group_name  = azurerm_resource_group.project_rg.name
    virtual_network_name = azurerm_virtual_network.project_vnet.name
    address_prefixes     = ["10.0.1.0/24"]
}}

# Public IP Addresses
resource "azurerm_public_ip" "vm_public_ip" {{
    for_each = {{ for vm in var.vm_resources : vm.name => vm }}
    
    name                = "${{each.value.name}}-public-ip"
    location            = azurerm_resource_group.project_rg.location
    resource_group_name = azurerm_resource_group.project_rg.name
    allocation_method   = "Dynamic"
}}

# Network Interfaces
resource "azurerm_network_interface" "vm_nic" {{
    for_each = {{ for vm in var.vm_resources : vm.name => vm }}

    name                = "${{each.value.name}}-nic"
    location            = azurerm_resource_group.project_rg.location
    resource_group_name = azurerm_resource_group.project_rg.name

    ip_configuration {{
        name                          = "internal"
        subnet_id                     = azurerm_subnet.project_subnet.id
        private_ip_address_allocation = "Dynamic"
        public_ip_address_id          = azurerm_public_ip.vm_public_ip[each.key].id
    }}
}}



# Virtual Machines
resource "azurerm_virtual_machine" "vm" {{
    for_each = {{ for vm in var.vm_resources : vm.name => vm }}

    name                  = each.value.name
    location              = azurerm_resource_group.project_rg.location
    resource_group_name   = azurerm_resource_group.project_rg.name
    vm_size               = each.value.size
    network_interface_ids = [azurerm_network_interface.vm_nic[each.key].id]

    storage_image_reference {{
        publisher = "Canonical"
        offer     = "UbuntuServer"
        sku       = "18.04-LTS"
        version   = "latest"
    }}

    storage_os_disk {{
        name              = "${{each.value.name}}-os-disk"
        caching           = "ReadWrite"
        create_option     = "FromImage"
        managed_disk_type = "Standard_LRS"
    }}

    os_profile {{
        computer_name  = each.value.name
        admin_username = each.value.username
        admin_password = each.value.password
    }}

    os_profile_linux_config {{
        disable_password_authentication = false
    }}
}}

# Storage Accounts
resource "azurerm_storage_account" "storage" {{
    for_each = {{ for st in var.storage_resources : st.name => st }}

    name                     = each.value.name
    resource_group_name      = azurerm_resource_group.project_rg.name
    location                 = azurerm_resource_group.project_rg.location
    account_tier             = "Standard"
    account_replication_type = "LRS"
}}

# Databases (Azure SQL Server)
resource "azurerm_mssql_server" "sql_server" {{
    for_each = {{ for db in var.database_resources : db.name => db }}

    name                         = each.value.name
    resource_group_name          = azurerm_resource_group.project_rg.name
    location                     = azurerm_resource_group.project_rg.location
    administrator_login          = each.value.username
    administrator_login_password = each.value.password
    version                      = "12.0"
}}
'''

    # Write the main.tf file
    terraform_dir = f"/opt/airflow/dags/terraform/{project_id}"
    try:
        with open(f"{terraform_dir}/main.tf", "w") as main_tf_file:
            main_tf_file.write(main_tf_content)
        print("main.tf file generated successfully.")
    except Exception as e:
        print(f"Error writing main.tf file: {e}")
        raise

def generate_variables_tf(project_id):
    """
    Generate the variables.tf file for Terraform.
    """
    variables_tf_content = '''
variable "project_id" {
    type = string
}

variable "project_location" {
    type = string
}

variable "vm_resources" {
    type = list(object({
        name     = string
        size     = string
        os_image = string
        username = string
        password = string
    }))
}

variable "storage_resources" {
    type = list(object({
        name = string
    }))
}

variable "database_resources" {
    type = list(object({
        name     = string
        username = string
        password = string
    }))
}
'''

    # Write the variables.tf file
    terraform_dir = f"/opt/airflow/dags/terraform/{project_id}"
    try:
        with open(f"{terraform_dir}/variables.tf", "w") as variables_tf_file:
            variables_tf_file.write(variables_tf_content)
        print("variables.tf file generated successfully.")
    except Exception as e:
        print(f"Error writing variables.tf file: {e}")
        raise


# Default args for DAG
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2025, 1, 19),
    'retries': 1,
}

# Define DAG
with DAG(
    dag_id='idp',
    default_args=default_args,
    schedule='@daily',
    catchup=False,
) as dag:

    consume_rabbitmq = PythonOperator(
        task_id='rabbitmq_consumer',
        python_callable=rabbitmq_consumer,
        provide_context=True,
    )

    fetch_requests = PythonOperator(
    task_id='fetch_from_mongo',
    python_callable=fetch_from_mongo,
    op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}"],  # Remove extra quotes
    provide_context=True,
    )

    send_createvm_notification = PythonOperator(
        task_id='send_notification',
        op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}"],
        python_callable=send_vm_notification,
    )

# Task to create Terraform directory
    create_directory = PythonOperator(
        task_id='create_directory',
        python_callable=create_terraform_directory,
         op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}"],  # Use project_id from RabbitMQ
    )

    # Task to generate terraform.auto.tfvars
    generate_tfvars_task = PythonOperator(
        task_id='generate_tfvars',
        python_callable=generate_tfvars,
        op_args=["{{ ti.xcom_pull(task_ids='fetch_from_mongo') }}"],  # Use resources from MongoDB
    )

    # Task to generate main.tf
    generate_main_tf_task = PythonOperator(
        task_id='generate_main_tf',
        python_callable=generate_main_tf,
        op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}"],  # Use project_id from RabbitMQ
    )

    # Task to generate variables.tf
    generate_variables_tf_task = PythonOperator(
        task_id='generate_variables_tf',
        python_callable=generate_variables_tf,
        op_args=["{{ ti.xcom_pull(task_ids='rabbitmq_consumer') | trim | replace('\"', '') }}"],  # Use project_id from RabbitMQ
    )


    # Task to run `terraform apply`
    terraform_apply = BashOperator(
    task_id='terraform_apply',
    bash_command='terraform init && terraform apply -auto-approve',
    cwd="{{ ti.xcom_pull(task_ids='create_directory') }}",
    env={
        "ARM_SUBSCRIPTION_ID": os.getenv("AZURE_SUBSCRIPTION_ID"),
        "ARM_CLIENT_ID": os.getenv("AZURE_CLIENT_ID"),
        "ARM_CLIENT_SECRET": os.getenv("AZURE_CLIENT_SECRET"),
        "ARM_TENANT_ID": os.getenv("AZURE_TENANT_ID"),
    },
    retries=3, 
    retry_delay=timedelta(minutes=5),
)



consume_rabbitmq >> fetch_requests >> send_createvm_notification >> create_directory >> [generate_tfvars_task, generate_main_tf_task, generate_variables_tf_task] >> terraform_apply
