import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

try:
    connection = pymysql.connect(
        host=os.getenv("AIVEN_DB_HOST"),
        port=int(os.getenv("AIVEN_DB_PORT")),
        user=os.getenv("AIVEN_DB_USER"),
        password=os.getenv("AIVEN_DB_PASSWORD"),
        database=os.getenv("AIVEN_DB_NAME"),
        ssl={}
    )

    print("Aiven MySQL connection successful!")

    connection.close()

except Exception as e:
    print("Connection failed:")
    print(e)