[![Build Status](https://travis-ci.com/golangci/golangci-web.svg?branch=master)](https://travis-ci.com/golangci/golangci-web)
[![GolangCI](https://golangci.com/badges/github.com/golangci/golangci-web.svg)](https://golangci.com)

## API
This repository contains code of web part of GolangCI.

## Technologies
We use React, TypeScript, Redux. Antd is used as a UI framework.

## Development
### How to run
```bash
npm run dev
```
It opens `https://dev.golangci.com` in a default browser.
You need to [generate self-signed SSL certificate](https://alexanderzeitler.com/articles/Fixing-Chrome-missing_subjectAltName-selfsigned-cert-openssl/) for local nginx and configure it:
```nginx
server {
      listen 443 ssl;
      server_name dev.golangci.com;

      ssl_certificate /etc/ssl/certs/dev.golangci.com.v3.crt;
      ssl_certificate_key /etc/ssl/certs/dev.golangci.com.v3.key;

      ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
      ssl_prefer_server_ciphers on;
      ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
      ssl_ecdh_curve secp384r1;
      ssl_session_cache shared:SSL:10m;
      ssl_session_tickets off;
      ssl_dhparam /etc/ssl/certs/dhparam.pem;

      ssl                  on;
      ssl_session_timeout  5m;

      location /sockjs-node {
        proxy_set_header X-Real-IP  $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;

        proxy_pass http://127.0.0.1:8080;

        proxy_redirect off;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }

      location / {
         proxy_pass http://127.0.0.1:8080;
      }
    }
```

### How to lint code
```bash
npm run lint_fix
```
It will run `tslint` in auto-fix mode.

### How to make test build
We deploy out code on Heroku. Heroku runs `npm run heroku-postbuild` to build code.

### How to test SSR
`npm run dev` runs dev-server without server-side rendering, to enable it run like in production:
```
npm start
```

# Contributing
See [CONTRIBUTING](https://github.com/golangci/golangci-web/blob/master/CONTRIBUTING.md).
