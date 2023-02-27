# Cowrite: Collaborative book writing 

Cowrite is a collaborative book writing platform that handles important co-authoring tasks such as authorship credit calculation and distribution based on the level of contribution the author had. The Cowrite API along with the React UI allow the users to write books in a user-friendly markdown interface, submit contribution requests and even parse previously completed projects from github while sustaining the contribution metadata.

Demo: https://cowrite-client.herokuapp.com/


## Quick-start in Docker

<br />

> **Start the Flask API**

```bash
$ cd flask-api
$ docker-compose pull   # download dependencies 
$ docker-compose build  # local set up
$ docker-compose up     # start the app 
```

At this point, the API should be up & running at `http://localhost:5000`, and we can test the interface using POSTMAN or `curl`.

<br />

> **Start the React UI** (use another terminal)

```bash
$ cd react-ui
$ docker-compose pull   # download dependencies 
$ docker-compose build  # local set up
$ docker-compose up     # start the app 
```

Once all the above commands are executed, the `React UI` should be visible in the browser. By default, the app redirects the guest users to authenticate. 
After we register a new user and signIN, all the private pages become accessible. 


<br />

## General Information

The product is built using a `two-tier` pattern where the React frontend is decoupled logically and physically from the API backend. In order to use the product in a local environment, a few simple steps are required: 

- `Compile and start` the **Flask API Backend**
  - be default the server starts on port `5000`
- `Compile and start` the **React UI**
  - UI will start on port `3000` and expects a running backend on port `5000`
- `Configuration` (Optional)
  - Change the API port
  - Configure the API port used by the React UI to communicate with the backend 

<br />

## Manual build

### Start the Flask API 

```bash
$ cd flask-api
$ 
$ # Create a virtual environment
$ virtualenv env
$ source env/bin/activate
$
$ # Install modules
$ pip install -r requirements.txt
$
$ # Set Up the Environment
$ export FLASK_APP=run.py
$ export FLASK_ENV=development
$ 
$ # Start the API
$ flask run 
```

<br />

### Compile & start the React UI

```bash
$ cd react-ui
$
$ # Install Modules
$ yarn
$
$ # Start for development (LIVE Reload)
$ yarn start 
```

<br />

### Configuration (Optional)

> Change the port exposed by the Flask API

```bash
$ flask run --port 5001
```

Now, the API can be accessed on port `5001`

<br />

> Update the API port used by the React Frontend

**API Server URL** - `src/config/constant.js` 

```javascript
const config = {
    ...
    API_SERVER: 'http://localhost:5000/api/'  // <-- The magic line
};
```

<br />


# Credits
---
**[React Flask Authentication](https://blog.appseed.us/react-flask-authentication/)** - Open-source full-stack seed project provided by **AppSeed [App Generator](https://appseed.us/)**
