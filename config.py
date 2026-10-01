import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    MYSQL_USER = os.getenv("MYSQL_USER")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
    MYSQL_HOST = os.getenv("MYSQL_HOST")
    MYSQL_PORT = os.getenv("MYSQL_PORT")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")

    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="mysql+pymysql",
        username=MYSQL_USER,
        password=MYSQL_PASSWORD,
        host=MYSQL_HOST,
        port=int(MYSQL_PORT),
        database=MYSQL_DATABASE
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
    "connect_args": {
        "ssl": {}
    }
}