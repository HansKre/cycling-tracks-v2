import L, {LatLngExpression, Map, LatLngBounds, LeafletMouseEvent} from 'leaflet';
import React, {useState, useEffect, useRef} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import Activity from '../pages/api/types/outgoing/activity';
import ActivityPolyline from '../pages/api/types/outgoing/polyline';
import styles from './Leaflet.module.css';
const polyUtil = require('polyline-encoded');
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
    const [filteredActivities, setFilteredActivities] = useState<Activity[] | []>([]);
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [authCookies, setAuthCookies] = useState<Cookie[]>(() => {
        const fromLocalStorage = localStorage.getItem(AUTH_COOKIES_KEY);
        if (fromLocalStorage) {
            return JSON.parse(fromLocalStorage);
        }
        return [];
    });
    const [polylineClicked, setPolylineClicked] = useState(false);
    const polylineClickedRef = useRef(polylineClicked);

    // update ref's value every time referenced value is updated
    useEffect(() => {
        polylineClickedRef.current = polylineClicked
    }, [polylineClicked]);

    // whenever authCookies change, store them to user's localStorage
    useEffect(() => {
        localStorage.setItem(AUTH_COOKIES_KEY, JSON.stringify(authCookies));
    }, [authCookies]);

    // execute filter
    useEffect(() => {
        if (Array.isArray(authCookies) && authCookies.length > 0 && map) {
            const filters = [
                (a: Activity) => !blacklistedActivities.includes(a.id),
                (a: Activity) => a.distance > 50 && a.distance < 65 && a.id !== 1791420271
            ]
            const filteredActivities = activities.filter(a => {
                return filters.reduce((prev, filterFn) => prev && filterFn(a), true)
            })
            setFilteredActivities(filteredActivities);
        }
    }, [activities])

    // fetch polyline
    useEffect(() => {
        if (Array.isArray(authCookies) && authCookies.length > 0 && map) {
            // reset map content before re-rendering it again
            clearMap(map, setCompletedCount, setPolylineClicked);
            for (const activity of filteredActivities) {
                const fromLocalStorage = localStorage.getItem(activity?.id?.toString());
                if (fromLocalStorage) {
                    const polyline: LatLngExpression[] = polyUtil.decode(fromLocalStorage);
                    polylineToMap(setCompletedCount, polyline, activity, map, polylineClickedRef, setPolylineClicked);
                } else {
                    postRequest(config.polylineApiUrl(activity.id), authCookies)
                        .then(data => data.json())
                        .then((json: ActivityPolyline) => {
                            if (json.hasOwnProperty('encodedPolyline')) {
                                const polyline: LatLngExpression[] = polyUtil.decode(json.encodedPolyline);
                                polylineToMap(setCompletedCount, polyline, activity, map, polylineClickedRef, setPolylineClicked);
                                localStorage.setItem(activity.id.toString(), json.encodedPolyline);
                            }
                        })
                        .catch(err => console.log(err, activity.id));
                }
            }
        }
    }, [filteredActivities])

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

    const completed = Math.round((completedCount / filteredActivities.length) * 100);
    return (
        <>
            {authCookies.length > 0 && <button onClick={(e) => setAuthCookies([])} >Logout</button>}
            {(!Array.isArray(authCookies) || authCookies.length === 0) && <Login title={'Cycling Activities'} onLogin={handleLogin} primaryColor={BG_COLOR} />}
            <p>{`${completedCount} / ${filteredActivities.length}`}</p>
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
            </MapContainer>
        </>
    )

    function resetAuthCookies() {
        localStorage.removeItem(AUTH_COOKIES_KEY);
        setAuthCookies([]);
    }
}

export default Leaflet;

/**
 * Configures polyline with popup for mouse-events and adds it to the map.
* @param polylineClickedRef needs to be a refernce to polylineClick due
*   to Closure, otherwise the polylineClicked value will be memoized and not updated by setPolylineClicked.
 */
function polylineToMap(
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>,
    polyline: LatLngExpression[],
    activity: Activity,
    map: Map,
    polylineClickedRef: React.MutableRefObject<boolean>,
    setPolylineClicked: React.Dispatch<React.SetStateAction<boolean>>
) {
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
    map.fitBounds(maxBounds);
    // add on-hover
    let popup;
    leafletPolyline.on('mouseover', (e: LeafletMouseEvent) => {
        if (!polylineClickedRef.current) {
            addPopup(e);
        }
    });
    leafletPolyline.on('click', (e: LeafletMouseEvent) => {
        setPolylineClicked(true);
        addPopup(e);
    });
    leafletPolyline.on('mouseout', e => {
        if (!polylineClickedRef.current) {
            leafletPolyline.setStyle({weight: 5});
            map.closePopup();
        }
    });

    function addPopup(e: LeafletMouseEvent) {
        leafletPolyline.setStyle({weight: 9});
        popup = L.popup();
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
            .on('remove', () => {
                // close on-click, when mouseout-event is not triggered
                if (polylineClickedRef.current) {
                    leafletPolyline.setStyle({weight: 5});
                    setPolylineClicked(false);
                }
            })
            .openOn(map);
    }
}

/**
 * Removes all polylines but keeps attributions.
 */
function clearMap(
    map: Map,
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>,
    setPolylineClicked: React.Dispatch<React.SetStateAction<boolean>>
) {
    map.eachLayer((layer: L.Layer) => {
        const hasEmptyContrib = !(layer.getAttribution && layer.getAttribution());
        const hasNoContrib = !layer.getAttribution;
        if (hasEmptyContrib || hasNoContrib) {
            map.removeLayer(layer);
        }
    })
    setCompletedCount(0);
    setPolylineClicked(false);
}