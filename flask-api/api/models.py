# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from datetime import datetime

import json

from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class GithubOwnership(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    contributor_github_username = db.Column(db.Text(), nullable=False, index=True)
    book_id = db.Column(db.Integer(), db.ForeignKey('book.id'), nullable=False, index=True)
    book = db.relationship('Book', backref='github_ownerships', foreign_keys=[book_id])
    percentage = db.Column(db.Float())

    def __repr__(self):
        return f"Github Ownership id {self.id}"

    def save(self):
        db.session.add(self)
        db.session.commit()


    @classmethod
    def update_ownership(self, new_percentage):
        self.percentage = new_percentage

   
    @classmethod
    def get_by_id(cls, id):
        return cls.query.get(id)

    
    @classmethod
    def fetch_ownerships(cls, contributor_github_username):
        res = []
        query = cls.query.filter_by(contributor_github_username=contributor_github_username)
        for row in query:
            res.append(row.toJSON())
       
        return res


    def toDICT(self):

        cls_dict = {}
        cls_dict['contributor_github_username'] = self.contributor_github_username
        cls_dict['book_id'] = self.book_id
        cls_dict['percentage'] = self.percentage

        return cls_dict

    def toJSON(self):

        return self.toDICT()



class Ownership(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    contributor_id = db.Column(db.Integer(),  db.ForeignKey('users.id'), nullable=False, index=True)
    contributor = db.relationship('Users', backref='ownerships', foreign_keys=[contributor_id])
    book_id = db.Column(db.Integer(), db.ForeignKey('book.id'), nullable=False, index=True)
    book = db.relationship('Book', backref='ownerships', foreign_keys=[book_id])
    percentage = db.Column(db.Float())

    def __repr__(self):
        return f"Ownership id {self.id}"

    def save(self):
        db.session.add(self)
        db.session.commit()


    @classmethod
    def update_ownership(self, new_percentage):
        self.percentage = new_percentage

   
    @classmethod
    def get_by_id(cls, id):
        return cls.query.get(id)

    @classmethod
    def get_by_contributor_and_book_id(cls, contributor_id, book_id):
        return cls.query.filter(contributor_id == contributor_id & book_id == book_id).first()


    def toDICT(self):

        cls_dict = {}
        cls_dict['contributor_id'] = self.contributor_id
        cls_dict['book_id'] = self.book_id
        cls_dict['percentage'] = self.percentage

        return cls_dict

    def toJSON(self):

        return self.toDICT()



class Contribution(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.Text())
    description = db.Column(db.Text())
    body = db.Column(db.Text())
    date_created = db.Column(db.DateTime(), default=datetime.utcnow)
    status = db.Column(db.String(32), nullable=False)
    contributor_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False, index=True)
    contributor = db.relationship('Users', backref='contributed_books', foreign_keys=[contributor_id])
    book_id = db.Column(db.Integer(), db.ForeignKey('book.id'), nullable=False, index=True)
    book = db.relationship('Book', backref='contributions', foreign_keys=[book_id])


    def __repr__(self):
        return f"Contribution Id {self.id}"

    def save(self):
        db.session.add(self)
        db.session.commit()


    def update_status(self, new_status):
        self.status = new_status

   
    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    
    @classmethod
    def get_by_contributor_id(cls, id):
        books = []
        query = cls.query.filter_by(contributor=id)
        for book in query:
            books.append(book.toJSON())
       
        return books
  

    @classmethod
    def get_by_author_id(cls, id):
        author_id = 66
        books = []
        query = cls.query.filter_by(contributor=author_id)
        for book in query:
            books.append(book.toJSON())
       
        return books



    def toDICT(self):

        cls_dict = {}
        cls_dict['_id'] = self.id
        cls_dict['title'] = self.title
        cls_dict['description'] = self.description
        cls_dict['body'] = self.body
        cls_dict['status'] = self.status
        cls_dict['contributor'] = self.contributor_id
        cls_dict['contributor_username'] = self.contributor.username
        cls_dict['book_id'] = self.book_id

        return cls_dict

    def toJSON(self):

        return self.toDICT()


class Book(db.Model):
    __tablename__ = 'book'
    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.String(125), nullable=False)
    body = db.Column(db.Text())
    description = db.Column(db.Text())
    is_github = db.Column(db.String(32))
    github_repo_name = db.Column(db.String(32))
    cover_image_url = db.Column(db.Text())
    date_created = db.Column(db.DateTime(), default=datetime.utcnow)
    author_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False, index=True)
    author = db.relationship('Users', backref='authored_books', foreign_keys=[author_id])


    def __repr__(self):
        return f"Book {self.title} By {self.author} Id {self.id}"

    def save(self):
        db.session.add(self)
        db.session.commit()


    def update(self, new_title, new_body, new_description):
        self.title = new_title
        self.body = new_body
        self.description = new_description

   
    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id).toJSON()

    @classmethod
    def get_by_id_raw(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_all(cls):
        books = []
        query = cls.query.all()
        for book in query:
            books.append(book.toJSON())


        return books



    def toDICT(self):

        cls_dict = {}
        cls_dict['_id'] = self.id
        cls_dict['title'] = self.title
        cls_dict['body'] = self.body
        cls_dict['description'] = self.description
        cls_dict['author'] = self.author_id
        cls_dict['cover_image_url'] = self.cover_image_url

        return cls_dict

    def toJSON(self):

        return self.toDICT()




class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(64), nullable=False)
    password = db.Column(db.Text())
    jwt_auth_active = db.Column(db.Boolean())
    date_joined = db.Column(db.DateTime(), default=datetime.utcnow)
    github_username = db.Column(db.Text())

    def __repr__(self):
        return f"User {self.username}, Books {self.authored_books}"

    def save(self):
        db.session.add(self)
        db.session.commit()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def update_email(self, new_email):
        self.email = new_email
    
    def update_github_username(self, username):
        self.github_username = username

    def update_username(self, new_username):
        self.username = new_username

    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_books(cls):
        query = cls.authored_books
        books = []
        for book in query:
            books.append(book.toJSON())

        return books
    
    @classmethod
    def get_github_username(cls):
        return cls.github_username


    @classmethod
    def get_contributions(cls):
        query = cls.authored_books
        contributions = []
        for book in query:
            for contribution in book.contributions:
                contributions.append(contribution.toJSON())

        return contributions



    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    def toDICT(self):

        cls_dict = {}
        cls_dict['_id'] = self.id
        cls_dict['username'] = self.username
        cls_dict['email'] = self.email

        return cls_dict

    def toJSON(self):

        return self.toDICT()

class JWTTokenBlocklist(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    jwt_token = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False)

    def __repr__(self):
        return f"Expired Token: {self.jwt_token}"

    def save(self):
        db.session.add(self)
        db.session.commit()