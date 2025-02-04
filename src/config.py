import json


def load_config(filename:str) -> dict:
    with open(filename) as f:
        return json.load(f)


CONFIG = {
    "InfluxDB":load_config('./config/InfluxDB.json'),
    "MongoDB":load_config('./config/MongoDB.json'),
    "MySQL":load_config('./config/MySQL.json')
    
}