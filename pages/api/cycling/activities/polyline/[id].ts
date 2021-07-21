import type {NextApiRequest, NextApiResponse} from 'next';
import GarminActivityPolyline from '../../../types/incoming/garmin-activity-polyline';
import Polyline from '../../../types/outgoing/polyline';
const client = require('tunneled-got');
const config = require('../../../config')
const {timeConverter} = require('../../../utils');
const simplify = require('simplify-js');
const fs = require('fs');

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


const fetchPolyline = async (id: string): Promise<GarminActivityPolyline | string> => {
    try {
        const details = await client.fetch(config.activityPolylineUrl(id),
            options);
        return JSON.parse(details);
    } catch (err) {
        return err.message;
    }
}

async function getPolyline(id: string): Promise<Polyline | string> {
    const data = await fetchPolyline(id);
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
    const id: string = <string>req?.query?.id;
    let response = await getPolyline(id);
    res.status(200).json(response);
}

export {getPolyline};