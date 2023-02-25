# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from datetime import datetime, timezone, timedelta
from email import header

from functools import wraps
from tabnanny import check

from flask import request
from flask_restx import Api, Resource, fields

import jwt

from .models import GithubOwnership, Ownership, Contribution, db, Users, Book, JWTTokenBlocklist
from .config import BaseConfig


import requests
import Levenshtein
rest_api = Api(version="1.0", title="Users API")


"""
    Flask-Restx models for api request and response data
"""

signup_model = rest_api.model('SignUpModel', {"username": fields.String(required=True, min_length=2, max_length=32),
                                              "email": fields.String(required=True, min_length=4, max_length=64),
                                              "password": fields.String(required=True, min_length=4, max_length=16)
                                              })

login_model = rest_api.model('LoginModel', {"email": fields.String(required=True, min_length=4, max_length=64),
                                            "password": fields.String(required=True, min_length=4, max_length=16)
                                            })

user_edit_model = rest_api.model('UserEditModel', {"userID": fields.String(required=True, min_length=1, max_length=32),
                                                   "username": fields.String(required=True, min_length=2, max_length=32),
                                                   "email": fields.String(required=True, min_length=4, max_length=64)
                                                   })

new_book_model = rest_api.model('NewBookModel', {"title": fields.String(required=True, min_length=2, max_length=125),
                                              })

get_all_books_model = rest_api.model('AllBooksModel', {"title": fields.String(required=True, min_length=2, max_length=125),
                                              })   


"""
GitHub Credentials
"""
CLIENT_ID = 'e274cb8b4acf0c94f05b'
CLIENT_SECRET = '5cb554f7de9b481fed9b6d6eaf60cfc9a56c5cc8'


"""
    Helper function for contribution level calculation
"""

def calculate_contribution(difftext, fulltext):

    
    added_lines = []
    removed_lines = []

    for line in difftext.splitlines():
        if line.startswith('+'):
            added_lines.append(line[1:])
        elif line.startswith('-'):
            removed_lines.append(line[1:])

    added_total = (' ').join(added_lines)
    removed_total = (' ').join(removed_lines)
        
    distance = Levenshtein.distance(added_total, removed_total)

    difference_score = distance / max(len(added_total), len(removed_total))

    percent_of_text = len(added_lines) / len(fulltext)

    contribution_score = percent_of_text * difference_score


    return contribution_score

def calculate_ownerships(contributions):
    pass

"""
   Helper function for JWT token required
"""

def token_required(f):

    @wraps(f)
    def decorator(*args, **kwargs):

        token = None


        if "authorization" in request.headers:
            token = request.headers["authorization"]

        if not token:
            return {"success": False, "msg": "Valid JWT token is missing"}, 400

        try:
            data = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=["HS256"])
            current_user = Users.get_by_email(data["email"])


            if not current_user:
                return {"success": False,
                        "msg": "Sorry. Wrong auth token. This user does not exist."}, 400

            token_expired = db.session.query(JWTTokenBlocklist.id).filter_by(jwt_token=token).scalar()

            if token_expired is not None:
                return {"success": False, "msg": "Token revoked."}, 400

            if not current_user.check_jwt_auth_active():
                return {"success": False, "msg": "Token expired."}, 400

        except:
            return {"success": False, "msg": "Token is invalid"}, 400

        return f(current_user, *args, **kwargs)

    return decorator


"""
    Flask-Restx routes
"""


@rest_api.route('/api/users/register')
class Register(Resource):
    """
       Creates a new user by taking 'signup_model' input
    """

    @rest_api.expect(signup_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _username = req_data.get("username")
        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)
        if user_exists:
            return {"success": False,
                    "msg": "Email already taken"}, 400

        new_user = Users(username=_username, email=_email)

        new_user.set_password(_password)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
                "msg": "The user was successfully registered"}, 200


@rest_api.route('/api/users/login')
class Login(Resource):
    """
       Login user by taking 'login_model' input and return JWT token
    """

    @rest_api.expect(login_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)

        if not user_exists:
            return {"success": False,
                    "msg": "This email does not exist."}, 400

        if not user_exists.check_password(_password):
            return {"success": False,
                    "msg": "Wrong credentials."}, 400

        # create access token uwing JWT
        token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)

        user_exists.set_jwt_auth_active(True)
        user_exists.save()

        return {"success": True,
                "token": token,
                "user": user_exists.toJSON()}, 200


@rest_api.route('/api/users/edit')
class EditUser(Resource):
    """
       Edits User's username or password or both using 'user_edit_model' input
    """

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):

        req_data = request.get_json()

        _new_username = req_data.get("username")
        _new_email = req_data.get("email")

        if _new_username:
            self.update_username(_new_username)

        if _new_email:
            self.update_email(_new_email)

        self.save()

        return {"success": True}, 200


@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
       Logs out User using 'logout_model' input
    """

    @token_required
    def post(self, current_user):

        _jwt_token = request.headers["authorization"]

        jwt_block = JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.now(timezone.utc))
        jwt_block.save()

        self.set_jwt_auth_active(False)
        self.save()


        return {"success": True}, 200




# =================================== BOOK API ENDPOINTS ===============================

@rest_api.route('/api/new-book')
class NewBook(Resource):
    """
       Create a new book using 'new_book_model' input
    """



    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):


        req_data = request.get_json()

        _title = req_data.get("title")
        _body = req_data.get("body")
        _description = req_data.get("description")


        book = Book(title=_title, body = _body, description = _description, author_id = self.id)

        book.save()

        ownership = Ownership(contributor_id = self.id, book_id = book.id, percentage = 1)
        ownership.save()
        print(ownership)

        return {"success": True}, 200


@rest_api.route('/api/update-book')
class UpdateBook(Resource):
    """
       Update a book using 'new_book_model' input
    """



    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):

        req_data = request.get_json()

        _id = req_data.get("id")

        book = Book.get_by_id(_id)

        if book['author'] != self.id:
            return {"success": False, "message" : "User not authorized"}, 400



        _title = req_data.get("title")
        _body = req_data.get("body")
        _description = req_data.get("description")


        book = Book.get_by_id_raw(_id)

        book.update(new_title=_title, new_body=_body, new_description = _description)


        book.save()


        return {"success": True}, 200




@rest_api.route('/api/get-all-books')
class GetAllBooks(Resource):
    """
       Create a new book using 'new_book_model' input
    """



    @rest_api.expect(get_all_books_model)
    def get(self):



        books = Book.get_all()


        return {"success": True,
        "books": books}, 200


@rest_api.route('/api/get-user-books')
class GetUserBooks(Resource):
    """
       Get all the books of a given user 'new_book_model' input
    """



    @rest_api.expect(new_book_model)
    @token_required
    def get(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails
        
        query = self.authored_books
        books = []
        for book in query:
            books.append(book.toJSON())

        return {"success": True,
        "books": books}, 200


@rest_api.route('/api/get-book')
class GetBook(Resource):
    """
       Get all the books of a given user 'new_book_model' input
    """



    @rest_api.expect(get_all_books_model)
    def get(self): 
        _id = request.args.get('book')

        book = Book.get_by_id(_id)

       

        return {"success": True,
        "book": book}, 200



#============================== CONTRIBUTION ENDPOINTS 

@rest_api.route('/api/new-contribution')
class NewContribution(Resource):
    """
       Create a new contribution using 'new_book_model' input
    """



    @rest_api.expect(new_book_model)
    @token_required
    def post(self, current_user):


        req_data = request.get_json()

        _body = req_data.get("body")
        _title = req_data.get("title")
        _book_id = req_data.get('book_id')
        _description= req_data.get('description')


        contribution = Contribution(title = _title, body = _body, book_id=_book_id, contributor_id =self.id, status = "submitted", description = _description)

        contribution.save()

        return {"success": True}, 200


@rest_api.route('/api/get-user-contributions')
class GetUserContributions(Resource):
    """
       Get all the contributions of a given user 'new_book_model' input
    """



    @rest_api.expect(new_book_model)
    @token_required
    def get(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        query = self.contributed_books
        books = []
        for book in query:
            books.append(book.toJSON())

        return {"success": True,
        "books": books}, 200


@rest_api.route('/api/get-book-contributions')
class GetBookContributions(Resource):
    """
       Get all the contributions of a given book 'new_book_model' input
    """



    @rest_api.expect(get_all_books_model)
    @token_required
    def get(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        _id = request.args.get('book')
        contributions = []
        
        book = Book.get_by_id_raw(_id)
        query = book.contributions
        print(query)
        for contribution in query:
            contributions.append(contribution.toJSON())

        return {"success": True,
        "contributions": contributions}, 200

@rest_api.route('/api/get-contribution')
class GetContribution(Resource):
    """
       Get all the contributions of a given book 'new_book_model' input
    """



    @rest_api.expect(get_all_books_model)
    #@token_required
    def get(self): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        _id = request.args.get('contrid')
        
        query = Contribution.get_by_id(_id)
        contribution = query.toJSON()
       
        return {"success": True,
        "contribution": contribution}, 200

@rest_api.route('/api/aprove-contribution')
class AproveContribution(Resource):
    """
       Get all the contributions of a given book 'new_book_model' input
    """

    @rest_api.expect(get_all_books_model)
    @token_required
    def post(self, curent_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails
        
        req_data = request.get_json()

        _bookid = req_data.get("bookid")
        

        book = Book.get_by_id(_bookid)

        if book['author'] != self.id:
            return {"success": False, "message" : "User not authorized"}, 400


        _title = req_data.get("title")
        _body = req_data.get("body")
        _description = req_data.get("description")
        _contrid = req_data.get("contrid")
        _percentage = req_data.get('percentage')



        book = Book.get_by_id_raw(_bookid)

        book.update(new_title=_title, new_body=_body, new_description = _description)


        book.save()

        contribution = Contribution.get_by_id(_contrid)
       

        for o in book.ownerships:
            ownr = Ownership.get_by_id(o.id)
            print(ownr.percentage, ownr.contributor_id)
            new_percent = ownr.percentage - (ownr.percentage * _percentage)
            ownr.update_ownership(new_percent)
            ownr.save()
            print(ownr.percentage, ownr.contributor_id)


        ownership = Ownership.get_by_contributor_and_book_id(contribution.contributor_id, _bookid)
        print(ownership)

        if not ownership:
            ownership = Ownership(contributor_id = contribution.contributor_id, book_id = _bookid, percentage = _percentage)
            ownership.save()
            print("new ownership")
        else:
            ownership.update_ownership(ownership.percentage + (ownership.percentage * _percentage))
            ownership.save()
            print('existing')
       
       
        print(ownership)
        print(_percentage)
        
        contribution.update_status("approved")
        contribution.save()
        print(book.ownerships)

       
        book.save()
        
        return {"success": True}, 200



# ========================== Ownership Endpoints

@rest_api.route('/api/get-ownerships')
class GetOwnerships(Resource):
    """
       Get all the contributions of a given book 'new_book_model' input
    """



    @rest_api.expect(get_all_books_model)
    #@token_required
    def get(self): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        _id = request.args.get('bookid')
        
        book = Book.get_by_id_raw(_id)
        print(book)

        ownerships = []
        for ownership in book.ownerships:
            ownership = ownership.toJSON()
            ownership['username'] = Users.get_by_id(ownership['contributor_id']).toJSON()['username']
            ownerships.append(ownership)
            #print(type(ownership))
        print(ownerships)

       
        return {"success": True,
        "ownerships": ownerships}, 200


# ============================= Github Proxy Routes =======================

@rest_api.route('/api/get-github-accesstoken')
class GetGithubAccessToken(Resource):
    """
       Get github auth token
    """

    

    @rest_api.expect(get_all_books_model)
    @token_required
    def get(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        code = request.args.get('code')
        
        params = f'?client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&code={code}'


        r = requests.get(f"https://github.com/login/oauth/access_token/{params}", headers={
            "Accept": "application/json"
        })
       
        return {"success": True,
        "response": r.json()}, 200


        
@rest_api.route('/api/get-github-user')
class GetGithubUserRepos(Resource):
    """
       Get github user repositories
    """

    

    @rest_api.expect(get_all_books_model)
    @token_required
    def get(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        auth = request.args.get('auth')
        print(auth)

        r = requests.get(f"https://api.github.com/user/repos", headers={
            "Authorization": auth
        }).json()


        self.update_github_username(r[0]['owner']['login'])
        self.save()
        
       
        return {"success": True,
        "response": r}, 200


@rest_api.route('/api/fetch-github-content')
class FetchFromGithub(Resource):
    """
       Get the book from Github Repository
    """

    

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        req_data = request.get_json()

        auth = 'BEARER ' + req_data.get('gitAuth')
        print(auth)
        repo = req_data.get('repo')
        user = req_data.get('user')
        image_url = None


        r = requests.get(f"https://api.github.com/repos/{user}/{repo}/readme", headers={
             "Authorization": auth,
             "Accept": "application/vnd.github+json"

        })

        try:
            image_url = requests.get(f"https://api.github.com/repos/{user}/{repo}/contents/cover.jpg", headers={
                "Authorization": auth,
                "Accept": "application/vnd.github+json"

            }).json().get('download_url')
        except:
            print('failed')

        res = r.json()

        markdown_content = requests.get(res['download_url']).text

        _title = markdown_content[:200].splitlines()[0]
        _body = markdown_content
        _description = markdown_content[:1000].splitlines()[2]



        book = Book(title=_title, body = _body, description = _description, cover_image_url = image_url, author_id = self.id)

        book.save()

        print(book.cover_image_url)

        contributors = {}
        total_contributions = 0

        pull_requests = requests.get(f'https://api.github.com/repos/{user}/{repo}/pulls?state=all', headers={
             "Authorization": auth,
             "Accept": "application/vnd.github+json"
        }).json()

        
        
        for i in range(len(pull_requests)):
            diff_url = f'https://github.com/{user}/{repo}/pull/' + pull_requests[i]['diff_url'].split('/')[-1]

            diff_file = requests.get(diff_url, headers={
                "Authorization": auth,
                "Accept": "application/vnd.github.diff"
            })

            contribution_score = calculate_contribution(diff_file.text, _body)
            total_contributions += contribution_score
            contributor = pull_requests[i]['user']['login']


            if contributor in contributors.keys():
                contributors[contributor] += contribution_score
            else:
                contributors[contributor] = contribution_score


        for key in contributors.keys():
            contributors[key] = contributors[key] / total_contributions
        
        for key in contributors.keys():
            print(key)
            if key == user:
                 in_app_ownership = Ownership(contributor_id = self.id, book_id = book.id, percentage = contributors[key])
                 in_app_ownership.save()
            else:
                github_ownership = GithubOwnership(contributor_github_username=key, book_id = book.id, percentage = contributors[key])
                print(github_ownership)
                github_ownership.save()

        
        return {"success": True, "response": contributors}, 200



@rest_api.route('/api/fetch-github-contributions')
class FetchGithubOwnerships(Resource):
    """
       Fetches the contributions of a github user
    """

    

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user): # TODO: fix this, bad abstraction, for some reason this same function inside models fails

        req_data = request.get_json()

        username = self.github_username

        print(username)

        user_ownerships = GithubOwnership.fetch_ownerships(username)
        
        print("USER OWNERSHIPS: ", user_ownerships)

        for ownership in user_ownerships:
            author = Book.get_by_id_raw(ownership['book_id']).author_id
            if self.id == author:
                continue
            check_ownership = Ownership.get_by_contributor_and_book_id(self.id, ownership['book_id'])
            print(check_ownership, type(check_ownership))
            if check_ownership is not None:
                continue
            in_app_ownership = Ownership(contributor_id = self.id, book_id = ownership['book_id'], percentage = ownership['percentage'])
            in_app_ownership.save()
            contribution = Contribution(title = "GitHub Contribution", body = "This is the cummulative contribution of the user on the project. The body of the user's contributions can only be seen on the respective pull reqeusts on GitHub", book_id=ownership['book_id'], contributor_id =self.id, status = "fetched from github (approved)", description = "This contribution has been fetched from GitHub")
            contribution.save()

        
        return {"success": True}, 200