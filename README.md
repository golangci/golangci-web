[![Build Status](https://travis-ci.com/golangci/golangci-web.svg?branch=master)](https://travis-ci.com/golangci/golangci-web)
[![GolangCI](https://golangci.com/badges/github.com/golangci/golangci-web.svg)](https://golangci.com)

## API
This repository contains code of web part of GolangCI.

## Technologies
We use React, TypeScript, Redux. Antd is used as a UI framework.

## Development
### Prepare SSL certificate

You need to [generate self-signed SSL certificate](https://stackoverflow.com/a/41366949) for local caddy (default self-signed caddy certificates aren't allowed by modern browsers):

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout ssl/golangci.key -out ssl/golangci.crt -extensions san -config <(echo "[req]"; echo distinguished_name=req; echo "[san]"; echo subjectAltName=DNS:dev.golangci.com,DNS:api.dev.golangci.com) -subj /CN=dev.golangci.com
```

After that add `golangci.crt` to the list of your OS trusted root CAs.

### Run Caddy

Map domains to the localhost:

```bash
sudo sh -c 'echo 127.0.0.1 dev.golangci.com >>/etc/hosts'
sudo sh -c 'echo 127.0.0.1 api.dev.golangci.com >>/etc/hosts'
```

The following will run Caddy server in background:
```
brew install caddy
sudo npm run caddy
```

### Run application server

```bash
npm run dev
```

It opens `https://dev.golangci.com` in a default browser.


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
