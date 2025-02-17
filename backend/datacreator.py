# data_generator.py
from opcua import Client
import time
import random
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from config import CONFIG

#OPC-UA 서버 정보 설정
SERVER_URL = "opc.tcp://192.168.100.102:4840"
NODE_ID = "ns=2;s=Heater_Temp"  # 단순화된 노드 ID

# OPC-UA 데이터 생성 함수
def read_plc_data():
    try:
        client = Client(SERVER_URL)
        client.connect()
        
        # 변수 노드 찾기
        objects = client.get_objects_node()
        plc = objects.get_child(["2:NewPLC"])
        var_comment = plc.get_child(["2:VariableComment"])
        heater = var_comment.get_child(["2:Heater_Temp"])
        
        value = heater.get_value()
        print(f"Heater Temperature: {value}")
        return value
        
    except Exception as e:
        print(f"Error: {e}")
        return None
        
    finally:
        if 'client' in locals():
            client.disconnect()


def read_random_data():
    data = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        'Excess Threshold Noise': random.randint(0, 100),
        'Excess Threshold Gyro': random.randint(0, 100),
        'Shortfall Threshold Gyro': random.randint(0, 100),
    }
    return data

