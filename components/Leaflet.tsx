import L, {LatLngExpression, Map as LeafletMap, LatLngBounds, LeafletMouseEvent} from 'leaflet';
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
import {Typography, Slider, Backdrop, CircularProgress} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

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

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

function Leaflet() {
    const [map, setMap] = useState<LeafletMap>();
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
    const [filters, setFilters] = useState({
        'preset-blacklist': (a: Activity) => !blacklistedActivities.includes(a.id)
    });
    const [minMaxDistance, setMinMaxDistance] = useState([0, 0]);
    const [minMaxDistanceVal, setMinMaxDistanceVal] = useState([0, 0]);
    const [isLoading, setIsLoading] = useState(false);

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
            const filteredActivities = activities.filter(a => {
                return Object.values(filters).reduce((prev, filterFn) => prev && filterFn(a), true)
            })
            setFilteredActivities(filteredActivities);
        }
        return () => setFilteredActivities([]);
    }, [activities, filters])

    // fetch polyline
    useEffect(() => {
        if (Array.isArray(authCookies) && authCookies.length > 0 && map) {
            setIsLoading(true);
            const promises = [];
            // reset map content before re-rendering it again
            clearMap(map, setCompletedCount, setPolylineClicked);
            for (const activity of filteredActivities) {
                const fromLocalStorage = localStorage.getItem(activity?.id?.toString());
                if (fromLocalStorage) {
                    const delayedPolyline = new Promise((resolve) => {
                        setTimeout(() => {
                            const polyline: LatLngExpression[] = polyUtil.decode(fromLocalStorage);
                            polylineToMap(polyline, activity, map, polylineClickedRef, setPolylineClicked);
                            setCompletedCount(prev => prev + 1);
                            resolve(true);
                        }, 150)
                    });
                    promises.push(delayedPolyline);
                } else {
                    const pendingRequest = postRequest(config.polylineApiUrl(activity.id), authCookies)
                        .then(data => data.json())
                        .then((json: ActivityPolyline) => {
                            if (json.hasOwnProperty('encodedPolyline')) {
                                const polyline: LatLngExpression[] = polyUtil.decode(json.encodedPolyline);
                                polylineToMap(polyline, activity, map, polylineClickedRef, setPolylineClicked);
                                localStorage.setItem(activity.id.toString(), json.encodedPolyline);
                                setCompletedCount(prev => prev + 1);
                            } else {
                                localStorage.setItem(activity.id.toString(), '');
                                setCompletedCount(prev => prev + 1);
                            }
                        })
                        .catch(err => console.log(err, activity.id));
                    promises.push(pendingRequest);
                }
            }
            Promise.all(promises)
                .then((values) => setIsLoading(false))
                .catch((reason) => setIsLoading(false))
        }
    }, [filteredActivities])

    // fetch activities
    useEffect(() => {
        if (Array.isArray(authCookies) && authCookies.length > 0) {
            setIsLoading(true);
            const pendingRequest = postRequest(config.activitiesApiUrl, authCookies)
                .then(data => data.json())
                .then(({body}) => setActivities(body))
                .catch(err => {
                    console.log(err);
                    resetAuthCookies();
                })
                .finally(() => setIsLoading(false));
        }
    }, [authCookies])

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await postRequest(config.loginApiUrl, {username, password});
            const newAuthCookies: Cookie[] = await response.json();
            setAuthCookies(newAuthCookies);
            return true;
        } catch (error) {
            console.log(`Something went wrong: ${error.message}`);
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    // set min-max Range for slider
    useEffect(() => {
        let newMin = 0, newMax = 0;
        activities.forEach(a => {
            newMin = Math.min(newMin, a.distance);
            newMax = Math.max(newMax, a.distance);
        });
        setMinMaxDistance([newMin, newMax]);
        if (minMaxDistanceVal == [0, 0]) {
            setMinMaxDistanceVal([newMin, newMax]);
        }
    }, [activities]);

    const handleDistanceChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setMinMaxDistanceVal(newValue);
            localStorage.setItem('distance', JSON.stringify(newValue));
        }
    }

    useEffect(() => {
        const newValue = localStorage.getItem('distance');
        if (newValue && newValue.length > 0) {setMinMaxDistanceVal(JSON.parse(newValue))}
    }, [])

    // reset distance-filter
    useEffect(() => {
        setFilters(prev => (
            {
                ...prev,
                'distance': (a: Activity) => a.distance > minMaxDistanceVal[0] && a.distance < minMaxDistanceVal[1]
            }
        ));
    }, [minMaxDistanceVal])

    const distanceRangeSlider = () => {
        return (<>
            <Typography id="range-slider" gutterBottom>
                Distance range
            </Typography>
            <Slider
                value={minMaxDistanceVal}
                onChange={handleDistanceChange}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={(value) => `${value}m`}
                min={minMaxDistance[0]}
                max={minMaxDistance[1]}
            />
        </>)
    }

    const classes = useStyles();

    const backDrop = () => {
        return (
            <Backdrop className={classes.backdrop} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        )
    }

    const completed = Math.round((completedCount / filteredActivities.length) * 100);
    const isLoggedIn = (Array.isArray(authCookies) && authCookies.length > 0);
    return (
        <>
            {backDrop()}
            {isLoggedIn && distanceRangeSlider()}
            {authCookies.length > 0 && <button onClick={(e) => setAuthCookies([])} >Logout</button>}
            {!isLoggedIn && <Login title={'Cycling Activities'} onLogin={handleLogin} primaryColor={BG_COLOR} />}
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
    polyline: LatLngExpression[],
    activity: Activity,
    map: LeafletMap,
    polylineClickedRef: React.MutableRefObject<boolean>,
    setPolylineClicked: React.Dispatch<React.SetStateAction<boolean>>
) {
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
    map: LeafletMap,
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