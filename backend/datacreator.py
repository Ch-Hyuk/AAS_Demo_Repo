# data_generator.py
import random
from datetime import datetime
# from influxdb_client import InfluxDBClient, Point


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

