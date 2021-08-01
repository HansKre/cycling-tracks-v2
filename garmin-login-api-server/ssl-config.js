const path = require('path');
const fs = require('fs');

function sslConfig(app, express) {
    // let content of ./.well-known/acme-challenge be accessible over http
    // for example: http://devops.selfhost.eu/.well-known/acme-challenge/long-random-alphanumeric-string-file-name
    app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), { dotfiles: 'allow' }));

    // read and return certificates
    let credentials;
    try {
        const privateKey = fs.readFileSync(path.join(__dirname, '.certs', 'privkey.pem'), 'utf8');
        const certificate = fs.readFileSync(path.join(__dirname, '.certs', 'cert.pem'), 'utf8');
        const ca = fs.readFileSync(path.join(__dirname, '.certs', 'fullchain.pem'), 'utf8');

        credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };
    } catch (error) {
        console.log(error);
    } finally {
        return credentials;
    }
}

module.exports = sslConfig;