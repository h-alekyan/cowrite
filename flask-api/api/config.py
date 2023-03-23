# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import os
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.realpath(__file__))


class BaseConfig():

    SQLALCHEMY_DATABASE_URI = 'postgres://vrneuyzjwfinnq:2002adb5d221902cd6a91b5f476f2a155954d1b73e5a6caa125295279ddcdfaa@ec2-3-234-204-26.compute-1.amazonaws.com:5432/dctq2hu23aecva'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "flask-app-secret-key-change-it"
    JWT_SECRET_KEY = "jwt-app-secret-key-change-it"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    PROPAGATE_EXCEPTIONS = True
