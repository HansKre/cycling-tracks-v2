import {LatLngExpression, Map} from 'leaflet';
import React, {useState, useEffect} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import Activity from '../pages/api/types/outgoing/activity';
import ActivityPolyline from '../pages/api/types/outgoing/polyline';
import styles from './Leaflet.module.css';
const polyUtil = require('polyline-encoded');
import L, {LatLngBounds} from 'leaflet';
import ProgressBar from "@ramonak/react-progress-bar";
import Login from './login/Login';
import Cookie from '../pages/api/types/incoming/Cookie';
import {postRequest} from './utils';
import config from '../pages/api/config'

const randomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor;
}

const stuttgart = {lat: 48.783333, lng: 9.183333};

let maxBounds: LatLngBounds;

// cologne activities blacklisted to avoid to big map-maxBounds
const blacklistedActivities = [7019832827, 7008550301, 7019832827, 7022366656, 7013851476];

const AUTH_COOKIES_KEY = 'authCookies';
const BG_COLOR = '#696969';
function Leaflet() {
    const [map, setMap] = useState<Map>();
    const [activities, setActivities] = useState<Activity[] | []>([]);
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [authCookies, setAuthCookies] = useState<Cookie[]>(() => {
        const fromLocalStorage = localStorage.getItem(AUTH_COOKIES_KEY);
        if (fromLocalStorage) {
            return JSON.parse(fromLocalStorage);
        }
        return [];
    });

    // whenever authCookies change, store them to user's localStorage
    useEffect(() => {
        localStorage.setItem(AUTH_COOKIES_KEY, JSON.stringify(authCookies));
    }, [authCookies]);

    // fetch polyline
    useEffect(() => {
        if (Array.isArray(authCookies) && authCookies.length > 0) {
            for (const activity of activities.filter(a => !blacklistedActivities.includes(a.id)).filter(a => a.distance > 50 && a.distance < 65 && a.id !== 1791420271)) {
                const fromLocalStorage = localStorage.getItem(activity?.id?.toString());
                if (fromLocalStorage) {
                    const polyline: LatLngExpression[] = polyUtil.decode(fromLocalStorage);
                    polylineToMap(setCompletedCount, polyline, activity, map);
                } else {
                    postRequest(config.polylineApiUrl(activity.id), authCookies)
                        .then(data => data.json())
                        .then((json: ActivityPolyline) => {
                            if (json.hasOwnProperty('encodedPolyline')) {
                                const polyline: LatLngExpression[] = polyUtil.decode(json.encodedPolyline);
                                polylineToMap(setCompletedCount, polyline, activity, map);
                                localStorage.setItem(activity.id.toString(), json.encodedPolyline);
                            }
                        })
                        .catch(err => console.log(err, activity.id));
                }
            }
        }
    }, [activities])

    // fetch activities
    // TODO: custom useActivities-Hook
    useEffect(() => {
        if (Array.isArray(authCookies) && authCookies.length > 0) {
            postRequest(config.activitiesApiUrl, authCookies)
                .then(data => data.json())
                .then(({body}) => setActivities(body))
                .catch(err => {
                    console.log(err);
                    resetAuthCookies();
                })
        }
    }, [authCookies])

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await postRequest(config.loginApiUrl, {username, password});
            const newAuthCookies: Cookie[] = await response.json();
            setAuthCookies(newAuthCookies);
            return true;
        } catch (error) {
            console.log(`Something went wrong: ${error.message}`);
            return false;
        }
    }

    const completed = Math.round((completedCount / activities.length) * 100);
    return (
        <>
            {(!Array.isArray(authCookies) || authCookies.length === 0) && <Login title={'Cycling Activities'} onLogin={handleLogin} primaryColor={BG_COLOR} />}
            <p>{`${completedCount} / ${activities.length}`}</p>
            <ProgressBar
                completed={completed ? completed : 0}
                borderRadius={'0px'}
                bgColor={BG_COLOR}
            />
            <MapContainer
                className={styles.leaflet}
                zoom={13}
                scrollWheelZoom={true}
                center={stuttgart}
                whenCreated={setMap}
                maxZoom={18}
                zoomOffset={-1}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* {lines?.length > 0 && lines.map(line => {
                const pathOptions = {color: randomColor(), weight: 5};
                return polyLine(line, pathOptions)
            })} */}
            </MapContainer>
        </>
    )

    function resetAuthCookies() {
        localStorage.removeItem(AUTH_COOKIES_KEY);
        setAuthCookies([]);
    }
}

export default Leaflet;

function polylineToMap(setCompletedCount: React.Dispatch<React.SetStateAction<number>>, polyline: LatLngExpression[], activity: Activity, map: Map | undefined) {
    setCompletedCount(prevState => prevState + 1);

    // create polyline
    const pathOptions = {color: randomColor(), weight: 5};
    const leafletPolyline = L.polyline(polyline, {color: randomColor(), weight: 5}).addTo(map);
    // re-center map
    if (maxBounds) {
        const bounds = leafletPolyline.getBounds();
        maxBounds = L.latLngBounds(
            L.latLng(Math.min(maxBounds.getSouthWest().lat, bounds.getSouthWest().lat),
                Math.min(maxBounds.getSouthWest().lng, bounds.getSouthWest().lng)),
            L.latLng(Math.max(maxBounds.getNorthEast().lat, bounds.getNorthEast().lat),
                Math.max(maxBounds.getNorthEast().lng, bounds.getNorthEast().lng))
        );
    } else {
        maxBounds = leafletPolyline.getBounds();
    }
    console.log(JSON.stringify(maxBounds, null, 2));
    map?.fitBounds(maxBounds);
    // add on-hover
    leafletPolyline.on('click', e => {
        leafletPolyline.setStyle({weight: 9});
        const popup = L.popup();
        popup
            .setLatLng(e.latlng)
            .setContent(`${activity.id},
                            ${activity.startTime},
                            ${activity.distance}km,
                            ${activity.averageSpeed}km/h,
                            ${activity.elevationGain}m,
                            ${activity.calories}kcal,
                            ${activity.duration}h`
            )
            .openOn(map);

    });
    // leafletPolyline.on('mouseout', e => {
    //     leafletPolyline.setStyle({weight: 5});
    //     map.closePopup();
    // });
}

