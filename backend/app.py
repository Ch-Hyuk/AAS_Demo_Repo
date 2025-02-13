from flask import Flask, jsonify, Response
from flask_cors import CORS
from bson.json_util import dumps

from backend.mongodb import find_DB_data, find_collecion_data, find_document_data, find_aas_data

app = Flask(__name__)
CORS(app)  # 모든 도메인에서의 요청 허용

@app.route('/')
def index():
    return "Main Page"

# 1. 데이터베이스 목록 반환
@app.route('/api/databases', methods=['GET'])
def get_db():
    return jsonify(find_DB_data())

# 2. 특정 데이터베이스의 컬렉션 목록 반환
@app.route('/api/<string:db_name>/collections', methods=['GET'])
def get_cols(db_name):
    return jsonify(find_collecion_data(db_name))

# 3. 특정 컬렉션의 문서 목록 반환
@app.route('/api/<string:db_name>/collections/<string:collection_name>', methods=['GET'])
def get_docs(db_name, collection_name):
    return dumps(find_document_data(db_name, collection_name)), 200, {'Content-Type': 'application/json'}

# AAS 목록 반환
@app.route('/api/<string:db_name>/collections/<string:collection_name>/aas', methods=['GET'])
def get_aas(db_name, collection_name):
    return Response(dumps(find_aas_data(db_name, collection_name)), mimetype='application/json')

# Submodel 목록 반환
@app.route('/api/<string:db_name>/collections/<string:collection_name>/<string:aas_name>/submodel', methods=['GET'])
def get_aas(db_name, collection_name, aas_name):
    return Response(dumps(find_aas_data(db_name, collection_name, aas_name)), mimetype='application/json')



if __name__ == '__main__':
    app.run(debug=True)
