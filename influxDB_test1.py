import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

token = "TtucFi-A8r7aF4D_eYgB6bIPkookE83DJVPJAb3epJ33EMhV-omn0OJeU46GJ3EsuS9MLf2HrixrkVckbBxf5Q=="
org = "ch_hyuk"
url = "http://localhost:8086"

client = InfluxDBClient(url=url, token=token, org=org)


print(client)
bucket="ch_hyuk"

write_api = client.write_api(write_options=SYNCHRONOUS)
   
for value in range(5):
  point = (
    Point("measurement1")
    .tag("tagname1", "tagvalue1")
    .field("field1", value)
  )
  write_api.write(bucket=bucket, org="ch_hyuk", record=point)
  time.sleep(1) # separate points by 1 second

query_api = client.query_api()

query = """from(bucket: "ch_hyuk")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")"""
tables = query_api.query(query, org="ch_hyuk")

for table in tables:
  for record in table.records:
    print(record)

query_api = client.query_api()

query = """from(bucket: "ch_hyuk")
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == "measurement1")
  |> mean()"""
tables = query_api.query(query, org="ch_hyuk")

for table in tables:
    for record in table.records:
        print(record)
