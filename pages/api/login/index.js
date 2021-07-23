import { fetch, CookieJar, Cookie } from "node-fetch-cookies";
// import fs from 'fs'
import config from '../config.js'

const activitiesUrl = 'https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?limit=20&start=0&_=1626966818321';

const login = async (username, password) => {
    // creates a CookieJar instance
    const cookieJar = new CookieJar('cookies.json');

    const options = {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "iframe",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'authority': 'sso.garmin.com',
            'origin': 'https://sso.garmin.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        },
        "referrer": "https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=de_DE&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=true&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false&mfaRequired=false&performMFACheck=false&rememberMyBrowserShown=true&rememberMyBrowserChecked=false",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "mode": "cors",
    };

    const optionsApi = {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "iframe",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'authority': 'connect.garmin.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            "nk": "NT"
        },
        "referrer": "https://connect.garmin.com/modern/activities",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "method": "GET",
        "mode": "cors",
    };
    // load cookies from the cookie jar
    // if (fs.existsSync('cookies.json')) {
    //     await cookieJar.load();
    // }

    // usual fetch usage, except with one or multiple cookie jars as first parameter
    const responseSignIn = await fetch(cookieJar, config.signInFormUrl, {
        ...options,
    });
    console.log('SignIn:', responseSignIn.status);
    // console.log(cookieJar.cookies);

    const responseSignInService = await fetch(cookieJar, config.signInServiceUrl, {
        ...options,
    });
    console.log('SingInService:', responseSignInService.status);
    // console.log(cookieJar.cookies);

    console.log(`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&embed=false`);

    const responseLogin = await fetch(cookieJar, config.loginUrl, {
        ...options,
        "method": "POST",
        "body": `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&embed=false`,
    });
    console.log('Login:', responseLogin.status, responseLogin.statusText);
    const loginBody = await responseLogin.text();
    if (responseLogin.status !== 200) {
        // console.log(loginBody);
        return responseLogin.status;
    }

    // \/\/connect.garmin.com\/modern\/?ticket=ST-02272549-YUw2BQOFTjpPwOILMWIN-cas";
    const from = loginBody.search('ticket=ST') + 7;
    const to = loginBody.search('cas";') + 3;
    const ticket = loginBody.substring(from, to);
    console.log(ticket);

    if (ticket.startsWith('ST-') && ticket.endsWith('-cas')) {
        console.log(config.ticketUrl(ticket));
        const responseTicket = await fetch(cookieJar, config.ticketUrl(ticket), {
            ...optionsApi
        });
        console.log('Ticket:', responseTicket.status);

        if (responseTicket.status !== 200) {
            return responseTicket.status;
        }

        const debug = false;
        if (debug) {
            const responseActivities = await fetch(cookieJar, config.activitiesUrl('cycling'), {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "nk": "NT",
                    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-app-ver": "4.45.0.19",
                    "x-lang": "de-DE",
                    "x-requested-with": "XMLHttpRequest",
                },
                "referrer": "https://connect.garmin.com/modern/activities",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors"
            });

            console.log('Activities:', responseActivities.status);
            console.log(responseActivities.statusText);
            console.log(await responseActivities.text());
            // console.log(cookieJar.cookies.get('connect.garmin.com').get('SESSIONID'));
        }

        // save the received cookies to disk
        // await cookieJar.save();
        return cookieJar;
    } else {
        console.log('Error: no ticket');
        return 'Error: no ticket';
    }
};

export default async function handler(req, res) {
    console.log('/api/login', req.method, req.body);
    if (req.method === 'POST') {
        const { username, password } = req.body;
        console.log('parsed:', username, password);
        if (username && password) {
            console.log(username, password);
            let response = await login(username, password);
            if (response) {
                if (typeof response === 'number') {
                    res.status(response).send('Something went wrong');
                } else {
                    const cookieJar = response;
                    const authCookies = [];
                    for (const cookie of cookieJar.cookiesAll()) {
                        authCookies.push(cookie);
                    }
                    res.status(200).json(JSON.stringify(authCookies));
                }
            }
            else {
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.status(400).send('Bad Request: username or password missing.')
        }
    } else {
        res.status(405).send('Method not allowed: only POST allowed.');
    }
}