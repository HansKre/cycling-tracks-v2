# Description

## Backlog

- [Response-Compression](http://expressjs.com/en/resources/middleware/compression.html)

  ```js
  # npm install compression
  var compression = require('compression')
  var express = require('express')

  var app = express()

  // compress all responses
  app.use(compression())

  // add all routes
  ```

## Deployment

```bash
# from server's root folder
sh deployment.sh
```

### Troubelshooting

There are two options to stop running `NodeJS` server.

1. First one is more generic:

    ```bash
    $ sudo netstat -tulpn | grep LISTEN | grep 3000
    tcp6       0      0 :::3000                 :::*                    LISTEN      16886/node
    $ kill 16886
    ```

2. Second uses a pre-set `process.title` inside of `server.js` which is for convenience configured as a `npm`-script: `npm run stop`.

## Configure self-hosted server for HTTPS

### Preconditions

- server running on a linux distribution with root access (via SSH)
- NodeJS server with Express is running on that server
- two separate SSH-sessions with your linux server

### Installation Steps

#### Prepare your NodeJS server

- Add `.well-known` folder-structure inside your NodeJS folder:

  ```folder-tree
  .
  |____package.json
  |____server.js
  |____.well-known
  | |____acme-challenge
  ```

- Let your NodeJS server serve static folder-content at `http://yourdomain.com/.well-known/acme-challenge/` by adding following line to your server-code:

  ```js
  app.use(express.static(`${__dirname}`, { dotfiles: 'allow' } ));
  ```

In case of security concerns, you may limit access to `/.well-known` folder:

  ```js
  const path = require('path')
  app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), { dotfiles: 'allow' }));
  ```

- Deploy above updates to your server.

#### Setup Certbot on the server

- Prepare dependencies (not sure if this step is required)

  ```bash
  sudo apt-get install software-properties-common
  sudo apt-get update
  sudo add-apt-repository ppa:certbot/certbot
  sudo apt-get update
  ```

- Install Certbot

  ```bash
  sudo apt-get install certbot
  ```

- Generate SSL certificate with certbot

  ```bash
  $ sudo certbot certonly --manual
  Saving debug log to /var/log/letsencrypt/letsencrypt.log
  Plugins selected: Authenticator manual, Installer None
  Enter email address (used for urgent renewal and security notices) (Enter 'c' to
  cancel): xxxxxx.yyyyyyy@zzzzzz.com

  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Please read the Terms of Service at
  https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
  agree in order to register with the ACME server at
  https://acme-v02.api.letsencrypt.org/directory
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  (A)gree/(C)ancel: a

  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Would you be willing to share your email address with the Electronic Frontier
  Foundation, a founding partner of the Let's Encrypt project and the non-profit
  organization that develops Certbot? We'd like to send you email about our work
  encrypting the web, EFF news, campaigns, and ways to support digital freedom.
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  (Y)es/(N)o: n
  Please enter in your domain name(s) (comma and/or space separated)  (Enter 'c'
  to cancel): devops.selfhost.eu
  Obtaining a new certificate
  Performing the following challenges:
  http-01 challenge for devops.selfhost.eu

  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  NOTE: The IP of this machine will be publicly logged as having requested this
  certificate. If you're running certbot in manual mode on a machine that is not
  your server, please ensure you're okay with that.

  Are you OK with your IP being logged?
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  (Y)es/(N)o: y

  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Create a file containing just this data:

  SECRET-RANDOM-ALPHANUMERIC-KEY

  And make it available on your web server at this URL:

  http://devops.selfhost.eu/.well-known/acme-challenge/SECRET-RANDOM-STRING

  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Press Enter to Continue
  ```

Stop at this point and do not continue, until you have setup your server to fullfill the challenge. Leave your SSH-session open and continue in another terminal window.

#### Configure server to fullfill the challenge

- Create `.well-known/acme-challenge/SECRET-RANDOM-STRING` from above
- Put your `SECRET-RANDOM-ALPHANUMERIC-KEY` inside of that `SECRET-RANDOM-STRING` file
- Your `.well-known` folder-structure inside your NodeJS folder should now look like the following:

  ```folder-tree
  .
  |____package.json
  |____server.js
  |____.well-known
  | |____acme-challenge
  | | |____<---a file going exactly by the name of your SECRET-RANDOM-STRING--->
  ```

- Test it out: `curl http://devops.selfhost.eu/.well-known/acme-challenge/SECRET-RANDOM-STRING` should return the `SECRET-RANDOM-ALPHANUMERIC-KEY`

**IMPORTANT** Do not share any of those secrets with anyone!

### Continue the challenge

```bash
  Press Enter to continue
  Waiting for verification...
  Cleaning up challenges

  IMPORTANT NOTES:
  - Congratulations! Your certificate and chain have been saved at:
    /etc/letsencrypt/live/devops.selfhost.eu/fullchain.pem
    Your key file has been saved at:
    /etc/letsencrypt/live/devops.selfhost.eu/privkey.pem
    Your cert will expire on 2021-10-27. To obtain a new or tweaked
    version of this certificate in the future, simply run certbot
    again. To non-interactively renew *all* of your certificates, run
    "certbot renew"
  - Your account credentials have been saved in your Certbot
    configuration directory at /etc/letsencrypt. You should make a
    secure backup of this folder now. This configuration directory will
    also contain certificates and private keys obtained by Certbot so
    making regular backups of this folder is ideal.
  - If you like Certbot, please consider supporting our work by:

    Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
    Donating to EFF:                    https://eff.org/donate-le
  ```

#### Move your certificates

- In general, `root` permissions can be required to access `/etc/*`.
- This is still the case, even if you change permissions on a file inside of a protected folder, hence `sudo chown -R pi:pi privkey.pem` won't work for `pi` user.
- Best solution I came up with so far is to move certificate to a folder where your server-user regular access to, for example: `mkdir .certs && sudo cp /etc/letsencrypt/live/devops.selfhost.eu/privkey.pem ./.certs`

#### Finalize NodeJS server configuration

- Add following code to your server to spin up a `https`-server.

  ```js
  const fs = require('fs');
  const http = require('http');
  const https = require('https');
  const express = require('express');

  const app = express();
  // Certificate
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
  const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
  // ... your routes here ...
  // Starting both http & https servers
  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  httpServer.listen(3000, () => {
    console.log('HTTP Server running on port 3000');
  });

  httpsServer.listen(3001, () => {
    console.log('HTTPS Server running on port 3001');
  });
  ```

- Test it: `curl -k https://localhost:3001` or in your browser, by going to `https://localhost:3001`

### Credits

Above steps were created with the help of [this](https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca) guide.

## Documentation of some concepts

### Using `import` with `NodeJS`

Many different approaches exist for how to mix `commonJS` `require` with `ES` style `import`:

- using `.mjs` extension: you can use only `import` but not `require` anymore
- declare `{"type":"module"}` in your `package.json` didn't work for me
- use `babel` --> too much overhead for such a simple task
- use `esm`-package

The last one seems to be the best and most versatile approach. Two steps are needed to use `esm`:

1. `npm install esm`
2. change your script:
   1. from `"start": "node server.js"`
   2. to `"start": "node -r esm server.js"`

Now you can use `import` on your server and also combine it with `require`.

**IMPORTANT**: `import` statements must come first before all other code.
