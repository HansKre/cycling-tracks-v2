const login = require('./login.mjs');

exports.handler = async (event) => {
    console.log(event);
    const { username, password } = event;
    let res;
    if (username && password) {
        console.log(username, password);
        let response = await login(username, password);
        if (response) {
            if (typeof response === 'number') {
                res.status(response).send('Something went wrong');
            }
            else {
                const cookieJar = response;
                const authCookies = [];
                for (const cookie of cookieJar.cookiesAll()) {
                    authCookies.push(cookie);
                }
                res = {
                    statusCode: 200,
                    body: JSON.stringify(authCookies)
                }
            }
        }
        else {
            res = {
                statusCode: 500,
                body: 'Internal Server Error'
            }
        }
    }
    else {
        res = {
            statusCode: 400,
            body: 'Bad Request: username or password missing.'
        }
    }
    //} else {
    //    res.status(405).send('Method not allowed: only POST allowed.');
    //}

    return res;
};