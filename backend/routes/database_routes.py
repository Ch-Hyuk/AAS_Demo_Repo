from flask import Blueprint, jsonify, Response, request
from bson.json_util import dumps
import csv

from mongodb import DB_create, create_collection, insert_data
from mongodb import find_DB_data, find_collecion_data, find_document_data
from read_aasx import read_aasx_file

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


# 파일 업로드 및 DB 저장 Endpoint
@db_routes.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'message': '파일이 업로드 되지 않았습니다.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': '선택된 파일이 없습니다.'}), 400
        
        if file.filename.endswith('.aasx'):
            # AASX 파일인 경우
            aas_data, submodel_data, DB_name = read_aasx_file(file)

            AASX_Repo = DB_create(DB_name)

            if AASX_Repo is None:
                return jsonify({'message': 'DB 생성 오류!'}), 500
            
            AASX_Col = create_collection(AASX_Repo)
            
            for col, data in zip(AASX_Col, [aas_data, submodel_data]):
                insert_data(col, data)
            
            return jsonify({'message': 'AASX 파일 업로드 성공!'})
    
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f'파일 업로드 오류: {e}')
        return jsonify({'message': '파일 업로드 오류!'}), 500