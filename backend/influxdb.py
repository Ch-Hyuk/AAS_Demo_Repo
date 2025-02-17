from flask import Flask, jsonify
from flask_cors import CORS  # React와의 통신을 위해 CORS 활성화
from influxdb_client import InfluxDBClient, WritePrecision, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from config import CONFIG
from datacreator import read_plc_data, read_random_data


import random
import time

influxdb = CONFIG['InfluxDB']

token = influxdb['DB_Token']
org = influxdb['DB_Org']
bucket = influxdb['DB_Bucket']
url = influxdb['DB_Host']


client = InfluxDBClient(url=url, token=token, org=org,verify_ssl=False)

def get_DB_data():
    """
    최근 1시간간 저장된 랜덤 데이터를 쿼리하여 출력하는 함수
    """
    query_api = client.query_api()

    query = f'''
    from(bucket:"{bucket}")
      |> range(start: -10h)
      |> filter(fn: (r) => r._measurement == "random_data" and r._field == "temperature")
      |> sort(columns: ["_time"], desc: false)
    '''
    
    result = query_api.query(org=org, query=query)
    
    data = []
    for table in result:
        for record in table.records:
             data.append({
                "time": record.get_time().isoformat(),
                "value": record.get_value(),
                "field": record.get_field(),
                "measurement": record.get_measurement(),
            })
    
    return data


def write_DB_data():
    """
    InfluxDB에 랜덤 데이터를 쓰는 함수
    """
    write_api = client.write_api(write_options=SYNCHRONOUS)
    
    while True:
        value = read_random_data()
        point = Point("random_data").tag("location", "room1").field("temperature", value)
        write_api.write(bucket, org, point)
        time.sleep(1)