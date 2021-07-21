import type {NextApiRequest, NextApiResponse} from 'next';
import GarminActivityDetail from '../../types/incoming/garmin-activity-details';
import ActivityDetails from '../../types/outgoing/activity-details';
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


const fetchDetails = async (id: string): Promise<GarminActivityDetail | string> => {
    try {
        const details = await client.fetch(`https://connect.garmin.com/modern/proxy/activity-service/activity/${id}/details?maxChartSize=2000&maxPolylineSize=4000&_=1615033738402`,
            options);
        return JSON.parse(details);
    } catch (err) {
        return err.message;
    }
}

function simplifyPolyline(data: GarminActivityDetail, response: any) {
    const details: GarminActivityDetail = <GarminActivityDetail>data;
    const toSimplify = details.geoPolylineDTO.polyline
        .map(p => ({x: <Number>p.lat, y: <Number>p.lon}));

    const simplifiedPoints = simplify(toSimplify,
        config.simplify_trip_tolerance, config.simplify_trip_highQuality);

    config.isDEBUG && console.log(details.geoPolylineDTO.polyline.length, simplifiedPoints.length, ((simplifiedPoints.length / details.geoPolylineDTO.polyline.length) * 100 - 100).toFixed(2));

    response = {
        polyLine: <ActivityDetails>simplifiedPoints,
    };
    return response;
}

async function getSimplifiedDetails(id: string): Promise<ActivityDetails | string> {
    const data = await fetchDetails(id);
    let response;
    if (data instanceof Object) {
        response = simplifyPolyline(data, response);
    } else {
        response = data;
    }
    return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id: string = <string>req?.query?.id;
    let response = await getSimplifiedDetails(id);
    res.status(200).json(response);
}

export {getSimplifiedDetails};