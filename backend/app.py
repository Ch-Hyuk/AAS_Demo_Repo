import eventlet
eventlet.monkey_patch()  # eventlet monkey patch 적용

import datetime
import random

# app.py
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

# Blueprints 임포트
from routes.database_routes import db_routes
from routes.demokit_mapping_routes import demokit_routes
from routes.value_data_routes import value_data_routes

#from sockets.socket_handlers import register_socket_handlers

from plc_reader import PlcReader
from datacreator import read_random_data

app = Flask(__name__)
CORS(app)  # 모든 도메인에서의 요청 허용

# SocketIO 초기화 (실시간 데이터 전송 기능 추가 시 사용)
socketio = SocketIO(app, cors_allowed_origins="*")

# Blueprints 등록
app.register_blueprint(db_routes)
app.register_blueprint(demokit_routes)
app.register_blueprint(value_data_routes)


@app.route('/')
def index():
    return "Main Page"


@socketio.on('connect')
def handle_connect():
    print('Client connected')

#plc_reader = PlcReader()

def data_loop():

    while True:
        try:
            #plc 데이터 read
            #data = plc_reader.read_plc_data()

            #랜덤 데이터 read
            data = read_random_data()
        except Exception as e:
            print(f"데이터 읽기 중 오류: {e}")
            data = {}
        socketio.emit('new_data', data)
        eventlet.sleep(300)

socketio.start_background_task(data_loop)


# @app.teardown_appcontext
# def cleanup(exception=None):
#     plc_reader.disconnect()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)

# if __name__ == '__main__':
#     # SocketIO를 사용한다면 socketio.run(app) 로 실행합니다.
#     app.run(debug=True)
#     # 또는, 실시간 기능이 필요하면 다음과 같이 실행:
#     #socketio.run(app, debug=True)
