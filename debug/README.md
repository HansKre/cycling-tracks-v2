# Description

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
