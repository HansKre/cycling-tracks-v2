import { login } from "./login";

export async function handleLogin(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;
        if (username && password) {
            let response = await login(username, password);
            if (response.status === 200) {
                if (response.body) {
                    const cookieJar = response.body;
                    const authCookies = [];
                    for (const cookie of cookieJar.cookiesAll()) {
                        authCookies.push(cookie);
                    }
                    res.status(200).json(authCookies);
                } else {
                    res.status(response.status).send(response.statusText);
                }
            } else {
                res.status(response.status).send(response.statusText);
            }
        } else {
            res.status(400).send('Bad Request: username or password missing.');
        }
    } else {
        res.status(405).send('Method not allowed: only POST allowed.');
    }
}
