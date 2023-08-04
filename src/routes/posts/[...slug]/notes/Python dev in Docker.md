---
title: Python dev in Docker
date: '2023-07-31'
description: Tutorial on how to set up a python dev environment in Docker
tags:
  - python
  - docker
---
# Python dev in Docker


1. Create venv
2. `python3 -m pip install bla bla`
3. `python3 -m freeze > requirements.txt`
4. `touch app.py`
5. Enter boilerplate into app.py - for flask this was:

```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'
```

6. Test app: python3 -m flask run
7. Dockerfile

```yaml
# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD ["python3", "-m" , "flask", "run", "--host=0.0.0.0"]
```

8. Build image `docker build --tag python-docker .`
9. Run: `docker run -dp 8000:5000 python_docker` (runs in detached mode and publiushes using syntax `[host port]:[container port]`, so this maps to localhost:8000:

```shell
$ curl localhost:8000
Hello, Docker!
```

## Create persistent volumes and network
1. for data: `docker volume create mysql`
2. for config: `docker volume create mysql_config`
3. Create network for db and app to talk to each other (user-defined bridge network): `docker network create mysqlnet`

### Run MySQL

```shell
docker run --rm -d -v mysql:/var/lib/mysql \
  -v mysql_config:/etc/mysql -p 3306:3306 \
  --network mysqlnet \
  --name mysqldb \
  -e MYSQL_ROOT_PASSWORD=p@ssw0rd1 \
  mysql
```

### Test connection
-> open command line within container.
`docker exec` runs a command in container
`-ti`  = `-t` technically attaches psuedo-TTY; more simply opens a terminal. `-i` is short for `-- interactive`, and keeps the terminal open when commands finished running (ie allows typing commands in).
`mysqldb mysql` passes `mysql` command to `mysqldb` container
`-u root`: username `root`
`-p`: password prompt

```shell
docker exec -ti mysqldb mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.23 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```
Ctrl+D to exit

## Connect the application to the database
Update `app.py` to read:

```python
import mysql.connector
import json
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'

@app.route('/widgets')
def get_widgets():
    mydb = mysql.connector.connect(
        host="mysqldb",
        user="root",
        password="p@ssw0rd1",
        database="inventory"
    )
    cursor = mydb.cursor()


    cursor.execute("SELECT * FROM widgets")

    row_headers=[x[0] for x in cursor.description] #this will extract row headers

    results = cursor.fetchall()
    json_data=[]
    for result in results:
        json_data.append(dict(zip(row_headers,result)))

    cursor.close()

    return json.dumps(json_data)

@app.route('/initdb')
def db_init():
    mydb = mysql.connector.connect(
        host="mysqldb",
        user="root",
        password="p@ssw0rd1"
    )
    cursor = mydb.cursor()

    cursor.execute("DROP DATABASE IF EXISTS inventory")
    cursor.execute("CREATE DATABASE inventory")
    cursor.close()

    mydb = mysql.connector.connect(
        host="mysqldb",
        user="root",
        password="p@ssw0rd1",
        database="inventory"
    )
    cursor = mydb.cursor()

    cursor.execute("DROP TABLE IF EXISTS widgets")
    cursor.execute("CREATE TABLE widgets (name VARCHAR(255), description VARCHAR(255))")
    cursor.close()

    return 'init database'

if __name__ == "__main__":
    app.run(host ='0.0.0.0')
```

### Rebuild image using updated code
1. add missing module: ` pip3 install mysql-connector-python`
2. add to requirements.txt: `pip3 freeze | grep mysql-connector-python >> requirements.txt`
3. build: `docker build --tag python-docker-dev .`
4. check no imageshave name _rest-server_ (`docker images`, and `docker rm <imagename>` to remove)
5. Assuming not, run image:

```shell
$ docker run \
  --rm -d \
  --network mysqlnet \
  --name rest-server \
  -p 8000:5000 \
  python-docker-dev
```

 6. Test connection by running some of the routes:
 	`curl http://localhost:8000`
 	`curl http://localhost:8000/initdb`
 	`curl http://localhost:8000/widgets`
