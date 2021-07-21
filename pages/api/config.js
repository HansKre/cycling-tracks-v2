const config = {
    isDEBUG: process.env.NODE_ENV === 'development',
    cookie_garmin: 'G_ENABLED_IDPS=google; _ga=GA1.2.987071538.1611160661; notice_behavior=implied,eu; notice_preferences=0:; notice_gdpr_prefs=0:; notice_poptime=1619726400000; cmapi_gtm_bl=ga-ms-ua-ta-asp-bzi-sp-awct-cts-csm-img-flc-fls-mpm-mpr-m6d-tc-tdc; cmapi_cookie_privacy=permit 1 required; __cfruid=d7f78fb0dbeb0b2ac08ccb1659fdb941ce305ec1-1626720699; GarminUserPrefs=de-DE; utag_main=v_id:017720a64051002ef4bae0612d780207800570700083e$_sn:9$_ss:0$_st:1626726657088$ses_id:1626723857851%3Bexp-session$_pn:5%3Bexp-session; CONSENTMGR=consent:false%7Cts:1626724929444; ADRUM=s=1626799757298&r=https%3A%2F%2Fsso.garmin.com%2Fsso%2Fsignin%3Fhash%3D-723646887; GARMIN-SSO=1; GarminNoCache=true; GARMIN-SSO-GUID=5C8C08548C95AA6F3EF1A97CFCD0EA0C0868790D; GARMIN-SSO-CUST-GUID=82a11586-b698-47fb-8dc5-c5819fdbbc03; SESSIONID=3fca22cb-31e2-4046-b9c8-8dbbf92d311b; __cflb=02DiuJLbVZHipNWxN8yYRX3u8XkAfEE59SGD4dTF8y8tC',
    simplify_trip_tolerance: 0.00001 * 2, //-70%
    simplify_trip_highQuality: true,
    activityPolylineUrl: (id) => `https://connect.garmin.com/modern/proxy/activity-service/activity/polyline/${id}?_=1626801326279`
}

module.exports = config;