# routes/demokit_routes.py
from flask import Blueprint, json, current_app
from postgredb import data_loading, mapping_data_loading

demokit_routes = Blueprint('demokit_routes', __name__)

@demokit_routes.route('/data/demokit_col', methods=['GET'])
def get_demokit_col():
    df = data_loading()  # 데이터 불러오기
    return current_app.response_class(
        response=json.dumps(df.to_dict(orient='records'), ensure_ascii=False),
        mimetype="application/json"
    )


@demokit_routes.route('/data/demokit_mapping', methods=['GET'])
def get_demokit_mapping():
    df = mapping_data_loading()  # 데이터 불러오기 
    return current_app.response_class(
        response=json.dumps(df.to_dict(orient='records'), ensure_ascii=False),
        mimetype="application/json"
    )