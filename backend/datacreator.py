# data_generator.py
from opcua import Client
import time
import random
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from config import CONFIG

Demokit = CONFIG["DemoKit"]

#OPC-UA 서버 정보 설정
def opc_ua_setting():

    server_url = Demokit["SERVER_URL"]
    node_id = Demokit["ns_index"]

    return server_url, node_id


# OPC-UA 데이터 생성 함수
def read_plc_data(server_url, node_id):
    Demokit_lable = Demokit["lable_data"]
    try:
        client = Client(server_url)
        client.connect()
        
        # 변수 노드 찾기
        objects = client.get_objects_node()
        plc = objects.get_child([node_id+":NewPLC"])
        var_comment = plc.get_child([node_id+":VariableComment"])


        # OPCUA Tag name 값 읽기
        values = {
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }

        for label in Demokit_lable:
            value = var_comment.get_child([node_id+":"+label]).get_value()
            values[label] = value

        return values
        
    except Exception as e:
        print(f"Error: {e}")
        return None
        
    finally:
        if 'client' in locals():
            client.disconnect()


def read_random_data():
    data = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        'value1': random.randint(0, 100),
        'lable1': 'Temperature',
        'value2': random.randint(0, 100),
        'lable2': 'Pressure',
        'value3': random.randint(0, 100),
        'lable3': 'Humidity',
    }
    return data

