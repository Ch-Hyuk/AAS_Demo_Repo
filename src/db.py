from config import CONFIG
from pymongo import MongoClient

influxdb = CONFIG['InfluxDB']
mongodb = CONFIG['MongoDB']

collection = mongodb['DB_Collection']
mongo_client = MongoClient(mongodb['DB_Client'])

# MongoDB 연결 설정

# 특정 데이터베이스 생성
def DB_create(DB_name):
    db = mongo_client[DB_name]

    return db


# 특정 컬렉션 생성
def create_collection(DB):
    repo_list = []
    for repo in collection:
        repo_list.append(DB[repo])

    return repo_list
    

# 데이터 삽입 함수
def insert_data(collection, data):
    for doc in data:
        collection.insert_one(doc)


# # 데이터 조회 함수
# def find_data(collection_name, query={}):
#     collection = get_collection(collection_name)
#     return list(collection.find(query))

# # 데이터 업데이트 함수
# def update_data(collection_name, query, new_values):
#     collection = get_collection(collection_name)
#     return collection.update_one(query, {"$set": new_values})

# # 데이터 삭제 함수
# def delete_data(collection_name, query):
#     collection = get_collection(collection_name)
#     return collection.delete_one(query)