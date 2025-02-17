# app.py
from flask import Flask, render_template
from flask_socketio import SocketIO
from influxdb import InfluxDBClient
import threading
import time

import os

from backend.mongodb import DB_create, create_collection, insert_data
from backend.data_uploading.aasx_loading import read_aasx_file

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# InfluxDB 클라이언트 초기화 (환경에 맞게 설정)
influx_client = InfluxDBClient(
    host='localhost',
    port=8086,
    username='your_username',
    password='your_password',
    database='your_database'
)

def query_influxdb():
    """주기적으로 InfluxDB에서 데이터를 조회하여 웹소켓 클라이언트에 전송하는 함수"""
    while True:
        # 예제 쿼리: 최근 1분간의 평균 온도 값을 조회 (InfluxQL 사용)
        query = 'SELECT mean("temperature") as mean_temp FROM "sensor_data" WHERE time > now() - 1m'
        try:
            result = influx_client.query(query)
            points = list(result.get_points())
            # 데이터가 없을 경우 대비
            if points:
                # 첫 번째 데이터 포인트에서 평균 온도 값 추출
                temperature = points[0]['mean_temp']
            else:
                temperature = None
        except Exception as e:
            print("InfluxDB 쿼리 오류:", e)
            temperature = None

        # 현재 시간 (예: HH:MM:SS 형식)
        current_time = time.strftime('%H:%M:%S')

        # 웹소켓 클라이언트에 데이터 전송
        socketio.emit('new_data', {'temperature': temperature, 'time': current_time})
        # 5초마다 업데이트 (필요에 따라 조정)
        time.sleep(5)

@app.route('/')
def index():
    # templates 폴더에 있는 index.html 렌더링
    return render_template('index.html')

if __name__ == '__main__':
    # 백그라운드에서 InfluxDB 쿼리 스레드 실행
    thread = threading.Thread(target=query_influxdb)
    thread.daemon = True
    thread.start()

    # Flask-SocketIO 서버 실행 (기본 포트는 5000)
    socketio.run(app, debug=True)
