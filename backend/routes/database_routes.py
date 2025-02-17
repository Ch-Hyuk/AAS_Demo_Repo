from flask import Blueprint, jsonify, Response
from bson.json_util import dumps
from mongodb import find_DB_data, find_collecion_data, find_document_data

db_routes = Blueprint('db_routes', __name__)

@db_routes.route('/')
def index():
    return "Main Page"

# 1. 데이터베이스 목록 반환
@db_routes.route('/api/databases', methods=['GET'])
def get_db():
    return jsonify(find_DB_data())

# 2. 특정 데이터베이스의 컬렉션 목록 반환
@db_routes.route('/api/<string:db_name>/collections', methods=['GET'])
def get_cols(db_name):
    return jsonify(find_collecion_data(db_name))

# 3. 특정 컬렉션의 문서 목록 반환
@db_routes.route('/api/<string:db_name>/collections/<string:collection_name>', methods=['GET'])
def get_docs(db_name, collection_name):
    return dumps(find_document_data(db_name, collection_name)), 200, {'Content-Type': 'application/json'}
