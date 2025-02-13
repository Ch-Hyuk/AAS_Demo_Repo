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

# DB 조회 함수
def find_DB_data():
    dbs = mongo_client.list_database_names()
    dbs = [db for db in dbs if db not in ['admin','local','config']]
    return dbs

# 특정 DB Collection 조회 함수
def find_collecion_data(DB_name):
    db = mongo_client[DB_name]
    collections = db.list_collection_names()
    return collections

# 특정 collection의 document 조회 함수
def find_document_data(DB_name, collection_name):
    db = mongo_client[DB_name]
    collection = db[collection_name]
    documents = list(collection.find())
    return documents


# AAS 데이터 조회 함수
def find_aas_data(DB_name, collection_name):
    db = mongo_client[DB_name]
    aas_repo = db[collection_name].find()
    aas_dict = {}
    for item in aas_repo:
        idShort = item.get('idShort')
        id = item.get('id')
        assetInformation = item.get('assetInformation', {})
        assetKind = assetInformation.get('assetKind')  
        globalAssetId = assetInformation.get('globalAssetId')

        # submodels = item.get('submodels', {})
        # reference = submodels.get('reference')
        aas_dict[idShort] = {
            'id': id,
            "assetInformation": 
            {'assetKind': assetKind,
            'globalAssetId': globalAssetId}
        }

    return aas_dict


# Submodel 데이터 조회 함수
def find_submodel_data(DB_name, collection_name, aas_name):
    db = mongo_client[DB_name]
    aas_repo = db[collection_name].find()
    aas_dict = {}
    for item in aas_repo:
        idShort = item.get('idShort')
        id = item.get('id')
        assetInformation = item.get('assetInformation', {})
        assetKind = assetInformation.get('assetKind')  
        globalAssetId = assetInformation.get('globalAssetId')

        # submodels = item.get('submodels', {})
        # reference = submodels.get('reference')
        aas_dict[idShort] = {
            'id': id,
            "assetInformation": 
            {'assetKind': assetKind,
            'globalAssetId': globalAssetId}
        }

    return aas_dict

@app.route('/a_agg/<string:a_id>', methods=['GET'])
def get_a_and_b_with_lookup(a_id):
    try:
        pipeline = [
            { "$match": {"_id": ObjectId(a_id)} },
            { "$lookup": {
                "from": "b",
                "let": { "b_ref": "$submodels.reference.keys.key.value" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [ "$id", "$$b_ref" ] } } }
                ],
                "as": "b_docs"
            }}
        ]

        results = list(db.a.aggregate(pipeline))
        if not results:
            return jsonify({"error": "해당 a document가 없습니다."}), 404

        a_doc = results[0]
        # b_docs는 배열 형태로 반환됨 (예제에서는 1개의 b document가 포함됨)
        b_docs = a_doc.get("b_docs", [])
        b_doc = b_docs[0] if b_docs else None

        # _id 필드 문자열 변환
        a_doc['_id'] = str(a_doc['_id'])
        if b_doc:
            b_doc['_id'] = str(b_doc['_id'])
        
        # b_docs 필드는 결과에서 제거하고, 단일 b document로 할당 (필요에 따라 수정)
        a_doc['b'] = b_doc
        a_doc.pop("b_docs", None)

        return jsonify(a_doc)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


# # 데이터 업데이트 함수
# def update_data(collection_name, query, new_values):
#     collection = get_collection(collection_name)
#     return collection.update_one(query, {"$set": new_values})

# # 데이터 삭제 함수
# def delete_data(collection_name, query):
#     collection = get_collection(collection_name)
#     return collection.delete_one(query)