import { fetch, CookieJar, Cookie } from "node-fetch-cookies";

const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

var bodyParser = require("body-parser");

console.log({ fetch, CookieJar, Cookie });

// Enable All CORS Requests for all routes
app.use(cors());

const config = {
    isDEBUG: process.env.NODE_ENV === "development",
    cookie_garmin:
        "G_ENABLED_IDPS=google; _ga=GA1.2.987071538.1611160661; notice_behavior=implied,eu; notice_preferences=0:; notice_gdpr_prefs=0:; notice_poptime=1619726400000; cmapi_gtm_bl=ga-ms-ua-ta-asp-bzi-sp-awct-cts-csm-img-flc-fls-mpm-mpr-m6d-tc-tdc; cmapi_cookie_privacy=permit 1 required; GarminUserPrefs=de-DE; utag_main=v_id:017720a64051002ef4bae0612d780207800570700083e$_sn:9$_ss:0$_st:1626726657088$ses_id:1626723857851%3Bexp-session$_pn:5%3Bexp-session; CONSENTMGR=consent:false%7Cts:1626724929444; __cflb=02DiuJLbVZHipNWxN8yYRX3u8XkAfEE59SGD4dTF8y8tC; GarminUserPrefs=de-DE; __cfruid=9e3ece4b91b6ef4992825e7a2b4b908516b63396-1626865719; ADRUM=s=1626877972643&r=https%3A%2F%2Fsso.garmin.com%2Fsso%2Fsignin%3Fhash%3D-450092455; GARMIN-SSO=1; GarminNoCache=true; GARMIN-SSO-GUID=5C8C08548C95AA6F3EF1A97CFCD0EA0C0868790D; GARMIN-SSO-CUST-GUID=82a11586-b698-47fb-8dc5-c5819fdbbc03; SESSIONID=701ed3ff-4f0e-46bd-b0de-f79b403a2568",
    simplify_trip_tolerance: 0.00001 * 2, //-70%
    simplify_trip_highQuality: true,
    activityPolylineUrl: id =>
        `https://connect.garmin.com/modern/proxy/activity-service/activity/polyline/${id}?_=1626801326279`,
    activitiesUrl: activityType =>
        `https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?activityType=${activityType}&sortBy=startLocal&sortOrder=desc&limit=500&start=0&_=1615033738343`,
    downloadUrl: id =>
        `https://connect.garmin.com/modern/proxy/download-service/export/gpx/activity/${id}`,
    signInFormUrl: "https://connect.garmin.com/signin/",
    signInServiceUrl:
        "https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=de_DE&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=true&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false&mfaRequired=false&performMFACheck=false&rememberMyBrowserShown=true&rememberMyBrowserChecked=false",
    loginUrl:
        "https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=de_DE&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=true&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false&mfaRequired=false&performMFACheck=false&rememberMyBrowserShown=true&rememberMyBrowserChecked=false",
    ticketUrl: id => `https://connect.garmin.com/modern/?ticket=${id}`
};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const activitiesUrl =
    "https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?limit=20&start=0&_=1626966818321";

const login = async (username, password) => {
    // creates a CookieJar instance
    const cookieJar = new CookieJar("cookies.json");

    const options = {
        headers: {
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua":
                '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "iframe",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            authority: "sso.garmin.com",
            origin: "https://sso.garmin.com",
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
        },
        referrer:
            "https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=de_DE&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=true&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false&mfaRequired=false&performMFACheck=false&rememberMyBrowserShown=true&rememberMyBrowserChecked=false",
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors"
    };

    const optionsApi = {
        headers: {
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua":
                '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "iframe",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            authority: "connect.garmin.com",
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            nk: "NT"
        },
        referrer: "https://connect.garmin.com/modern/activities",
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET",
        mode: "cors"
    };
    // load cookies from the cookie jar
    // if (fs.existsSync('cookies.json')) {
    //     await cookieJar.load();
    // }

    // usual fetch usage, except with one or multiple cookie jars as first parameter
    const responseSignIn = await fetch(cookieJar, config.signInFormUrl, {
        ...options
    });
    console.log("SignIn:", responseSignIn.status);
    // console.log(cookieJar.cookies);

    const responseSignInService = await fetch(
        cookieJar,
        config.signInServiceUrl,
        {
            ...options
        }
    );
    console.log("SingInService:", responseSignInService.status);
    console.log(cookieJar.cookies);

    const responseLogin = await fetch(cookieJar, config.loginUrl, {
        ...options,
        method: "POST",
        body: `username=${encodeURIComponent(
            username
        )}&password=${encodeURIComponent(password)}&embed=false`
    });
    console.log("Login:", responseLogin.status, responseLogin.statusText);
    const loginBody = await responseLogin.text();
    if (responseLogin.status !== 200) {
        console.log(responseLogin);
        console.log(loginBody);
        return responseLogin.status;
    }

    // \/\/connect.garmin.com\/modern\/?ticket=ST-02272549-YUw2BQOFTjpPwOILMWIN-cas";
    const from = loginBody.search("ticket=ST") + 7;
    const to = loginBody.search('cas";') + 3;
    const ticket = loginBody.substring(from, to);
    console.log(ticket);

    if (ticket.startsWith("ST-") && ticket.endsWith("-cas")) {
        console.log(config.ticketUrl(ticket));
        const responseTicket = await fetch(cookieJar, config.ticketUrl(ticket), {
            ...optionsApi
        });
        console.log("Ticket:", responseTicket.status);

        if (responseTicket.status !== 200) {
            return responseTicket.status;
        }

        const debug = false;
        if (debug) {
            const responseActivities = await fetch(
                cookieJar,
                config.activitiesUrl("cycling"),
                {
                    headers: {
                        accept: "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                        nk: "NT",
                        "sec-ch-ua":
                            '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-app-ver": "4.45.0.19",
                        "x-lang": "de-DE",
                        "x-requested-with": "XMLHttpRequest"
                    },
                    referrer: "https://connect.garmin.com/modern/activities",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    body: null,
                    method: "GET",
                    mode: "cors"
                }
            );

            console.log("Activities:", responseActivities.status);
            console.log(responseActivities.statusText);
            console.log(await responseActivities.text());
            // console.log(cookieJar.cookies.get('connect.garmin.com').get('SESSIONID'));
        }

        // save the received cookies to disk
        // await cookieJar.save();
        return cookieJar;
    } else {
        console.log("Error: no ticket");
        return "Error: no ticket";
    }
};

app.post('/api/login', async function (req, res) {
    console.log("/api/login", req.method, req.body);
    if (req.method === "POST") {
        const { username, password } = req.body;
        console.log("parsed:", username, password);
        if (username && password) {
            console.log(username, password);
            let response = await login(username, password);
            if (response) {
                if (typeof response === "number") {
                    res.status(response).send("Something went wrong");
                } else {
                    const cookieJar = response;
                    const authCookies = [];
                    for (const cookie of cookieJar.cookiesAll()) {
                        authCookies.push(cookie);
                    }
                    res.status(200).json(JSON.stringify(authCookies));
                }
            } else {
                res.status(500).send("Internal Server Error");
            }
        } else {
            res.status(400).send("Bad Request: username or password missing.");
        }
    } else {
        res.status(405).send("Method not allowed: only POST allowed.");
    }
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
}, app).listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
});

// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
// });
