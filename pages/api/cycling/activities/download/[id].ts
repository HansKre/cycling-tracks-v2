import type {NextApiRequest, NextApiResponse} from 'next';
const client = require('tunneled-got');
const config = require('../../../config')

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


const fetchGpx = async (id: string): Promise<any> => {
    try {
        return await client.fetch(config.downloadUrl(id),
            options);
    } catch (err) {
        return err.message;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id: string = <string>req?.query?.id;
    let response = await fetchGpx(id);
    res.status(200).send(response);
}