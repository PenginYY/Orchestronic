from airflow import DAG
from airflow.operators.python import PythonOperator
import socketio
import time
from datetime import datetime
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from bson.objectid import ObjectId

def send_vm_notification():
    sio = socketio.Client()
    project_id = "67d001419cc9dc98a8ca17ee"

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

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'retries': 1,
}

with DAG(
    dag_id='notification',
    default_args=default_args,
    catchup=False,
) as dag:

    send_notification = PythonOperator(
        task_id='send_notification',
        python_callable=send_vm_notification,
    )

send_notification
