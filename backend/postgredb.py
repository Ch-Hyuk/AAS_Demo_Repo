from sqlalchemy import create_engine
import pandas as pd
import os
from config import CONFIG

print(os.getcwd())
PostgreSQL = CONFIG['PostgreSQL']

database= PostgreSQL['DB_Name']
user= PostgreSQL['User_Name']
password= PostgreSQL['User_Password']
host= PostgreSQL['DB_Host']
port= PostgreSQL['DB_Port']


db_url = f"postgresql://{user}:{password}@{host}:{port}/{database}?client_encoding=utf8"
engine = create_engine(db_url)

def data_loading():
    query = "SELECT * FROM plc_address_mapping"
    df = pd.read_sql(query, engine)
    return df



def mapping_data_loading():
    query = "SELECT semantic_data_en, semantic_data_kr FROM plc_address_mapping"
    df = pd.read_sql(query, engine)
    return df
# excel_file = './backend/demokit_mapping_data.xlsx'
# df = pd.read_excel(excel_file)
# df.to_sql('plc_address_mapping', engine, if_exists='append', index=False)
