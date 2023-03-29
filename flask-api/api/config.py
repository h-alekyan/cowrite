# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import os
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
psql_uri = os.getenv('DATABASE_URL').replace('postgres', 'postgresql', 1) #Heroku gives us postrgres but our sqlalchemy recent update requires postgresql at the beginning, we use replace with 1 to replace only the first occurence since there is a chance the randomly generated letters inside the uri could also be postgres


class BaseConfig():

    SQLALCHEMY_DATABASE_URI = psql_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "a14E25A6S7"
    JWT_SECRET_KEY = "ZU567JIk09JA"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=5)
    PROPAGATE_EXCEPTIONS = True
