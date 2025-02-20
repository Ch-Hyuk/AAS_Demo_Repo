import json


def load_config(filename:str) -> dict:
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)


CONFIG = {
    "InfluxDB":load_config('./config/InfluxDB.json'),
    "MongoDB":load_config('./config/MongoDB.json'),
    "PostgreSQL":load_config('./config/PostgreSQL.json'),
    "DemoKit":load_config('./config/DemoKitOPC-UA.json'),
}

print("CONFIG file loaded")