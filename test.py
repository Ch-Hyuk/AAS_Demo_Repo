import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

token = os.environ.get("fn-u3Mg2jWrm-w1QwYhqWt-rirgZwhEXW21xI560tRc1KwKnq6Z4PynkKraSGse4OTOYALwdgU7jD5nZ2uzEVA==")
org = "ch_hyuk"
url = "http://localhost:8086"

client = InfluxDBClient(url=url, token=token, org=org)

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
