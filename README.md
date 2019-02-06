# App Store for DHIS 2

Visit the live [DHIS 2 app store](https://play.dhis2.org/appstore/)

# Setup

## Clone the repo
```bash
git clone https://github.com/dhis2/dhis2-appstore.git
```

## Create & seed test-database
Create a database `appstore` in postgres with user/login appstore/appstore123 (or change credentials in `packages/server/src/knexfile.js`

```bash
cd packages/server
yarn install
knex migrate:latest

## Create back-end config file
Coming soon


```
auth0.domain=<auth0 domain>
auth0.issuer=<auth0 certificate issuer>
auth0.clientId=<auth0 client id>
auth0.clientSecret=<auth0 client secret>
auth0.securedRoute=/secured/*
auth0.base64EncodedSecret=false 
auth0.authorityStrategy=ROLES
auth0.defaultAuth0ApiSecurityEnabled=false
auth0.signingAlgorithm=HS256
```


## Frontend config
The frontend needs to know some basic information about the server to configure routes and API endpoints.
This is located in `app/default.config.js`.

You can rename or copy this file to override the settings.
Tries to load config files in the following order:

1. default.config.js
2. config.js

Environment specific configurations are also supported, and are loaded if environment is set to either `development` or `production`.

* development.config.js
* production.config.js

Note that the exported objects from each config file are merged with the previous, so any options not changed are kept from the previous config.

*Note: If you make any changes, you will need to rebuild or restart webpack-dev-server for the changes to take effect.*

### Example Development Config
`development.config.js`
```javascript
module.exports = {
    api: {
        baseURL: "http://localhost:3098/api/",
        redirectURL: "http://localhost:9000/user"
    },
    routes: {
        baseAppName: ""
    }
};
```


##### Base app name
This is the basename of where the app is located, used by routes. If it's hosted at `http://localhost:8080/appstore` this should be `/appstore`.
```javascript
routes.baseAppName: '/appstore'
```
##### API BaseURL
The endpoint of the backend API to be used. 
```javascript
api.baseURL: 'http://localhost:8080/appstore/api/',
```

##### API Redirect URL
The URL to be used when auth0 has successfully logged in a user, and is redirected back to the page. Note that this URL needs to be whitelisted on the auth0 side aswell.
```javascript
 api.redirectURL: 'http://localhost:8080/appstore/user/'
```

# Run the project

### Start the backend and frontend
```bash
mvn clean install
```

Web API available at `localhost:3000/`.

Frontend at `localhost:9000/appstore/`.

#### Start the Web API backend independently

```bash
cd packages/server
yarn install
yarn start
```
Will be available at `localhost:9000/`.
This will skip the webpack-bundling, and the frontend will not be available.

### Start the front-end app independently (dev)

```bash
cd packages/client
yarn install
yarn start
```
Will be available at `localhost:9000`. Using webpack-dev-server. 

Note that to use all the features of the app, you will need to run a back-end server. This can be done in frontend-development by running the back-end server as shown in the previous section, and changing the appropriate config settings (most likely just api.baseURL, api.redirectURL and routes.baseAppName).

