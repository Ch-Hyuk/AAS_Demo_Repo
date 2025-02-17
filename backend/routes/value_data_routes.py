# routes/valu_data_routes.py
from flask import Flask, jsonify, Blueprint
from flask_cors import CORS
from influxdb import get_DB_data  # 위에서 작성한 함수 임포트
from datacreator import read_random_data

value_data_routes = Blueprint('value_data_routes', __name__)

@value_data_routes.route('/api/data', methods=['GET'])
def get_data():
    """
    API 엔드포인트: InfluxDB에서 데이터를 가져와 JSON 형태로 반환.
    """
    data = get_DB_data()  # 데이터 가져오기
    return jsonify(data)

@value_data_routes.route('/api/randomdata', methods=['GET'])
def get_random_data():
    data = read_random_data()  # 데이터 가져오기
    return jsonify(data)
