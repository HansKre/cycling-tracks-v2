const config = {
    isDEBUG: process.env.NODE_ENV === 'development',
    simplify_trip_tolerance: 0.00001 * 2, //-70%
    simplify_trip_highQuality: true,
    activityPolylineUrl: (id) => `https://connect.garmin.com/modern/proxy/activity-service/activity/polyline/${id}?_=1626801326279`,
    activitiesUrl: (activityType) => `https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?activityType=${activityType}&sortBy=startLocal&sortOrder=desc&limit=500&start=0&_=1615033738343`,
    downloadUrl: (id) => `https://connect.garmin.com/modern/proxy/download-service/export/gpx/activity/${id}`,
    signInFormUrl: 'https://connect.garmin.com/signin/',
    signInServiceUrl: 'https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=de_DE&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=true&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false&mfaRequired=false&performMFACheck=false&rememberMyBrowserShown=true&rememberMyBrowserChecked=false',
    loginUrl: 'https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=de_DE&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=true&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false&mfaRequired=false&performMFACheck=false&rememberMyBrowserShown=true&rememberMyBrowserChecked=false',
    ticketUrl: (id) => `https://connect.garmin.com/modern/?ticket=${id}`,
    loginApiUrl: 'https://devops.selfhost.eu/api/login',
    // loginApiUrl: 'http://localhost:3000/api/login',
    polylineApiUrl: (id) => `/api/cycling/activities/polyline/${id}`,
    activitiesApiUrl: '/api/cycling/activities',
    // max process.title-length is limited to 13 chars
    garminLoginServerProcessTitle: 'garminLoginSe',
}

module.exports = config;