const config = {
    isDEBUG: process.env.NODE_ENV === 'development',
    cookie_garmin: 'SESSIONID=293c6f7b-4ffa-4ae6-a95f-91443d15d3ad; GARMIN-SSO=1; GARMIN-SSO-CUST-GUID=82a11586-b698-47fb-8dc5-c5819fdbbc03; GARMIN-SSO-GUID=5C8C08548C95AA6F3EF1A97CFCD0EA0C0868790D; GarminNoCache=true; cmapi_gtm_bl=; notice_behavior=implied,eu; G_ENABLED_IDPS=google; cmapi_cookie_privacy=permit 1,2,3; notice_gdpr_prefs=0,1,2:; notice_poptime=1619726400000; notice_preferences=2:; ADRUM=s=1626606923801&r=https%3A%2F%2Fsso.garmin.com%2Fsso%2Fsignin%3Fhash%3D-1690894247; GarminUserPrefs=de-DE; __cfruid=96c3c77021fadc69958449affed4818c25ae0a65-1626606907; __cflb=02DiuJLbVZHipNWxN8yYRX3u8XkAfEE59dqFxYZdeHr6p; notice_behavior=implied,eu',
    simplify_trip_tolerance: 0.00001 * 2, //-70%
    simplify_trip_highQuality: true
}

module.exports = config;