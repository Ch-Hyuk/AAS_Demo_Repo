from flask import Flask, jsonify
from flask_cors import CORS
from bson.json_util import dumps

from db import find_DB_data, find_collecion_data, find_document_data

app = Flask(__name__)
CORS(app)  # 모든 도메인에서의 요청 허용

@app.route('/')
def index():
    return "Hello, Flask!"

# 1. 데이터베이스 목록 반환
@app.route('/api/databases', methods=['GET'])
def get_db():
    return jsonify(find_DB_data())

# 2. 특정 데이터베이스의 컬렉션 목록 반환
@app.route('/api/<string:db_name>/collections', methods=['GET'])
def get_cols(db_name):
    return jsonify(find_collecion_data(db_name))

# 3. 특정 컬렉션의 문서 목록 반환
@app.route('/api/<string:db_name>/<string:collection_name>/documents', methods=['GET'])
def get_docs(db_name, collection_name):
    return dumps(find_document_data(db_name, collection_name)), 200, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    app.run(debug=True)
