# socket_handlers.py
import time
from flask_socketio import emit
from datacreator import read_random_data

def register_socket_handlers(socketio):
    @socketio.on('connect')
    def handle_connect():
        print("클라이언트 연결됨")

    @socketio.on('disconnect')
    def handle_disconnect():
        print("클라이언트 연결 해제됨")

    @socketio.on('start_collection')
    def handle_start_collection():
        """
        클라이언트로부터 'start_collection' 이벤트를 받으면,
        백그라운드 스레드로 데이터를 주기적으로 생성하여 전송합니다.
        """
        def generate_data():
            while True:
                data = read_random_data()  # 0~100 사이의 임의 데이터 생성
                socketio.emit('new_data', {'data': data})
                time.sleep(1)  # 1초 간격으로 데이터 전송

        # 백그라운드 스레드로 데이터 생성 시작
        socketio.start_background_task(generate_data)
        emit('collection_started', {'message': '데이터 수집 시작됨'})
