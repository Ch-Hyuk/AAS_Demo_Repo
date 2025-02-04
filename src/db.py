from config import CONFIG
from pymongo import MongoClient

influxdb = CONFIG['InfluxDB']
mongodb = CONFIG['MongoDB']

mongo_client = MongoClient(mongodb['DB_Client'])

# MongoDB 연결 설정

# 특정 데이터베이스 선택
db = mongo_client[mongodb["DB_Name"]]

# 특정 컬렉션을 가져오는 함수
def get_collection(name):
    return db[name]

# 데이터 삽입 함수
def insert_data(collection_name, data):
    collection = get_collection(collection_name)
    result = collection.insert_one(data)
    return result.inserted_id

# 데이터 조회 함수
def find_data(collection_name, query={}):
    collection = get_collection(collection_name)
    return list(collection.find(query))

# 데이터 업데이트 함수
def update_data(collection_name, query, new_values):
    collection = get_collection(collection_name)
    return collection.update_one(query, {"$set": new_values})

# 데이터 삭제 함수
def delete_data(collection_name, query):
    collection = get_collection(collection_name)
    return collection.delete_one(query)