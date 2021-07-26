# Description

## Deployment

```bash
scp -r garmin-login-api-server/* pi@raspberrypi:garmin-login-api-server
ssh pi@raspberrypi -f 'screen -d -m cd garmin-login-api-server && npm run start'
```

## [How to create an https server?](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/)

1. To generate a self-signed certificate, run the following in your shell:

    ```bash
    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    # using devops.selfhost.eu as fully qualified domain name
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem
    ```

    This should leave you with two files, cert.pem (the certificate) and key.pem (the private key). Put these files in the same directory as your Node.js server file. This is all you need for a SSL connection.

2. Setup the node server

    ```js
    const https = require('https');
    const fs = require('fs');

    const options = {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    };

    https.createServer(options, function (req, res) {
      res.writeHead(200);
      res.end("hello world\n");
    }).listen(8000);
    ```

3. Test it: `curl -k https://localhost:8000` or in your browser, by going to `https://localhost:8000`

## `express.js`

Server to log out requests for debugging purposes. One caveat: when using `CookieJar`, browser-behavior is replicated when cookies are sent. This means, your cookies for my-domain.com won't be sent to a server running on `localhost`.

## `server.js`

Example for how to mix `commonJS` `require` with `ES` style `import`.

Many different approaches exist:

- using `.mjs` extension: you can use only `import` but not `require` anymore
- declare `{"type":"module"}` in your `package.json` didn't work for me
- use `babel` --> too much overhead for such a simple task
- use `esm`-package --> this did the trick.

Two steps are needed to use `esm`:

1. `npm install esm`
2. change your script:
   1. from `"start": "node server.js"`
   2. to `"start": "node -r esm server.js"`

Now you can use `import` on your server and also combine it with `require`.

**IMPORTANT**: `import` statements must come first before all other code.
