import type {NextApiRequest, NextApiResponse} from 'next';
import GarminActivity from '../../types/incoming/garmin-activity';
import Activity from '../../types/outgoing/activity';
const client = require('tunneled-got');
const config = require('../../config')
const {timeConverter} = require('../../utils.js');
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

enum ActivityType {
    CYCLING = 'cycling',
    RUNNING = 'running'
}

/**
 * @function fetchActivities Download activities from Garmin
 */
const fetchActivities = async (activityType: ActivityType = ActivityType.CYCLING): Promise<[GarminActivity] | string> => {
    try {
        const activities = await client.fetch(`https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?activityType=${activityType}&sortBy=startLocal&sortOrder=desc&limit=500&start=0&_=1615033738343`,
            options);
        return JSON.parse(activities);
    } catch (err) {
        return err.message;
    }
}

/**
* @function getActivities Downloads activities from Garmin and maps them to the internal Activity-Datamodel
*/
async function getActivities() {
    const data = await fetchActivities(ActivityType.CYCLING);
    let response;
    if (Array.isArray(data)) {
        const activities: [GarminActivity] = <[GarminActivity]>data;
        response = <[Activity]>activities.map((a: GarminActivity) => ({
            id: a.activityId,
            startTime: a.startTimeLocal,
            name: a.activityName,
            type: a.activityType.typeKey,
            distance: a.distance,
            duration: new Date(a.duration * 1000).toISOString().substr(11, 8),
            elevationGain: a.elevationGain,
            elevationLoss: a.elevationLoss,
            averageSpeed: a.averageSpeed,
            calories: a.calories
        }));
    } else {
        response = data;
    }
    return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let response = await getActivities();
    res.status(200).json(response);
}

export {getActivities};
