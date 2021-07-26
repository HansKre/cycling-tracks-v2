import type {NextApiRequest, NextApiResponse} from 'next';
import GarminActivityPolyline from '../../../types/incoming/garmin-activity-polyline';
import Polyline from '../../../types/outgoing/polyline';
import Response from '../../../types/Response';
const config = require('../../../config')
import {fetch, CookieJar, Cookie} from "node-fetch-cookies";

const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    "nk": "NT",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-app-ver": "4.40.1.0",
    "x-lang": "de-DE",
    "x-requested-with": "XMLHttpRequest",
    "cookie": config.cookie_garmin
};

const options = {
    "headers": headers,
    "referrer": "https://connect.garmin.com/modern/activities?activityType=cycling&sortBy=startLocal&sortOrder=desc",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors"
};


const fetchPolyline = async (cookieJar: CookieJar, id: string): Promise<GarminActivityPolyline | Response> => {
    try {
        const details = await fetch(cookieJar, config.activityPolylineUrl(id),
            options);
        if (details.status === 200) {
            const json = await details.json()
            return json;
        } else {
            return handleError(details as Response);
        }
    } catch (err) {
        return err.message;
    }
}

const handleError = (response: Response): Response => {
    return {
        status: response.status,
        statusText: response.statusText
    }
}

async function getPolyline(cookieJar: CookieJar, id: string): Promise<Polyline | string> {
    const data = await fetchPolyline(cookieJar, id);
    let response;
    if (data instanceof Object) {
        const polyline: GarminActivityPolyline = <GarminActivityPolyline>data;
        response = {
            encodedPolyline: polyline.gPolyline.encodedSamples
        }
    } else {
        response = data;
    }
    return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(`/cycling/activities/${req?.query?.id}`)
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed: Only POST supported.')
        return false;
    }
    const id: string = <string>req?.query?.id;
    const authCookies = req.body;
    if (id && authCookies && Array.isArray(authCookies)) {
        const cookieJar = new CookieJar();
        authCookies.forEach(cookie => {
            cookieJar.addCookie(Cookie.fromObject(cookie));
        })
        let response = await getPolyline(cookieJar, id);
        res.status(200).json(response);
    } else {
        res.status(400).send('Bad Request: missing auth cookies.');
    }
}

export {getPolyline};