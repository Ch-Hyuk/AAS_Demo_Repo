from config import CONFIG
import psycopg2
from psycopg2 import sql

PostgreSQL = CONFIG['PostgreSQL']

db_conn = psycopg2.connect(
    database=PostgreSQL['DB_Name'],
    user=PostgreSQL['User_Name'],
    password=PostgreSQL['User_Password'],
    host=PostgreSQL['DB_Host'],
    port=PostgreSQL['DB_Port'],
    )


cur = db_conn.cursor()

print(cur)