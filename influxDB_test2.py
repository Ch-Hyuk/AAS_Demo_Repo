from datetime import datetime, timedelta
import pprint
import time
from influxdb import InfluxDBClient
from copy import deepcopy


def get_ifdb(db, host='localhost', port=8086, user='root', passwd='root'):
    # Create an object include information for connect to the InfluxDB
    client = InfluxDBClient(host, port, user, passwd, db)

    try:
        # Try to Create database
        client.create_database(db)

        # If you can create database or have a database
        # there is no problem connecting to the InfluxDB
        print('Connection Successful')
        print('=======================')
        print('     Connection Info')
        print('=======================')
        print('host :', host)
        print('port :', port)
        print('username :', user)
        print('database :', db)
    except:
        # Generate error if you can't create database (can't connect to ifdb)
        print('Connection Failed')
        pass

    return client


def my_test(ifdb):
    # save points in the json_body
    json_body = []
    tablename = 'my_table'
    fieldname = 'my_field'
    point = {
        "measurement": tablename,
        "tags": {
            "host": "forever_happiness",
            "country": "South Korea",
            "region": "Busan"
        },
        "fields": {
            # Initialize data to zero
            fieldname: 0
        },
        "time": None,
    }

    # vals = [1, 2, ... 9, 10]
    vals = list(range(1, 11))

    for v in vals:
        # InfluxDB is based on UTC
        # so it should be timed with KCT
        dt = datetime.now() - timedelta(hours=-9)

        np = deepcopy(point)
        np['fields'][fieldname] = v
        np['time'] = dt
        json_body.append(np)

        # wait a second
        time.sleep(1)

    # Write the data for 10 seconds on the influxDB at once
    ifdb.write_points(json_body)

    result = ifdb.query('select * from %s' % tablename)
    pprint.pprint(result.raw)


def do_test():
    # Connect to InfluxDB
    mydb = get_ifdb(db='myDB')

    # write data to mydb
    my_test(mydb)


if __name__ == '__main__':
    do_test()