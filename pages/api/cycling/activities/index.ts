import type {NextApiRequest, NextApiResponse} from 'next';
import GarminActivity from '../../types/incoming/garmin-activity';
import Activity from '../../types/outgoing/activity';
import Response from '../../types/Response';
const client = require('tunneled-got');
const config = require('../../config')
const {timeConverter} = require('../../utils.js');
const simplify = require('simplify-js');
const fs = require('fs');
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

enum ActivityType {
    CYCLING = 'cycling',
    RUNNING = 'running'
}

/**
 * @function fetchActivities Download activities from Garmin
 */
const fetchActivities = async (cookieJar: CookieJar, activityType: ActivityType = ActivityType.CYCLING): Promise<Response<GarminActivity[] | null>> => {
    try {
        // const activities = await client.fetch(config.activitiesUrl(activityType),
        // options);
        const response = await fetch(cookieJar, config.activitiesUrl(activityType),
            options);
        if (response.status === 200) {
            const json = await response.json()
            return {status: response.status, statusText: response.statusText, body: json};
        } else {
            return {status: response.status, statusText: response.statusText, body: null};
        }
    } catch (err) {
        return err.message;
    }
}

/**
* @function getActivities Downloads activities from Garmin and maps them to the internal Activity-Datamodel
*/
async function getActivities(cookieJar: CookieJar): Promise<Response<Activity[] | null>> {
    const response = await fetchActivities(cookieJar, ActivityType.CYCLING);
    if (response.status === 200) {
        if (Array.isArray(response.body)) {
            const activities: GarminActivity[] = <GarminActivity[]>response.body;
            const mappedActivities = <Activity[]>activities.map((a: GarminActivity) => ({
                id: a.activityId,
                startTime: a.startTimeLocal,
                name: a.activityName,
                type: a.activityType.typeKey,
                distance: parseFloat((a.distance / 1000)?.toFixed(2)),
                duration: new Date(a.duration * 1000).toISOString().substr(11, 8),
                elevationGain: parseFloat((a.elevationGain)?.toFixed(2)),
                elevationLoss: parseFloat((a.elevationLoss)?.toFixed(2)),
                averageSpeed: parseFloat((a.averageSpeed * 3.612716723).toFixed(2)),
                calories: a.calories
            }));
            return {status: 200, statusText: 'Ok', body: mappedActivities}
        } else {
            return {status: 500, statusText: 'Expected response.body to be an array of GarminActivity'}
        }
    } else {
        return {status: response.status, statusText: response.statusText}
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('/cycling/activities')
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed: Only POST supported.')
        return false;
    }
    const authCookies = req.body;
    if (authCookies && Array.isArray(authCookies)) {
        const cookieJar = new CookieJar();
        authCookies.forEach(cookie => {
            cookieJar.addCookie(Cookie.fromObject(cookie));
        })
        const response = await getActivities(cookieJar);
        res.status(response.status).json(response);
    } else {
        res.status(400).send('Bad Request: missing auth cookies or improper format.');
    }
}

export {getActivities};
