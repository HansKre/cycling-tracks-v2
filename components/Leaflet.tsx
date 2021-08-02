import {LatLngExpression, Map as LeafletMap} from 'leaflet';
import React, {useState, useEffect, useRef} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import Activity from '../pages/api/types/outgoing/activity';
import ActivityPolyline from '../pages/api/types/outgoing/polyline';
import styles from './Leaflet.module.css';
const polyUtil = require('polyline-encoded');
import ProgressBar from "@ramonak/react-progress-bar";
import Login from './login/Login';
import Cookie from '../pages/api/types/incoming/Cookie';
import postRequest from './utils/postRequest';
import config from '../pages/api/config'
import {Typography, Slider, Backdrop, CircularProgress} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import clearMap from './utils/clearMap';
import polylineToMap from './utils/polylineToMap';

const stuttgart = {lat: 48.783333, lng: 9.183333};

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

    // execute filter
    useEffect(() => {
        const filteredActivities = activities.filter(a => {
            return Object.values(filters).reduce((prev, filterFn) => prev && filterFn(a), true)
        });
        setFilteredActivities(filteredActivities);
    }, [activities, filters])

    // fetch polyline
    useEffect(() => {
        if (isLoggedIn && map) {
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
                } else if (fromLocalStorage === null) {
                    // localStorage.getItem returns null for unknown keys
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
                } else {
                    // localStorage.getItem returned an empty string, which is equivalent to an empty polyline
                    setCompletedCount(prev => prev + 1);
                }
            }
            Promise.all(promises)
                .then((values) => setIsLoading(false))
                .catch((reason) => setIsLoading(false))
        }
    }, [filteredActivities])

    // fetch activities
    useEffect(() => {
        if (isLoggedIn) {
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
            localStorage.setItem(AUTH_COOKIES_KEY, JSON.stringify(newAuthCookies));
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
        if (minMaxDistanceVal[0] === 0 && minMaxDistanceVal[1] === 0) {
            setMinMaxDistanceVal([newMin, newMax]);
        }
    }, [activities]);

    const handleDistanceChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setMinMaxDistanceVal(newValue);
            localStorage.setItem('distance', JSON.stringify(newValue));
        }
    }

    // initially restore user settings for distance-filter
    useEffect(() => {
        const newValue = localStorage.getItem('distance');
        if (newValue && newValue.length > 0) {setMinMaxDistanceVal(JSON.parse(newValue))}
    }, [])

    // update distance-filter
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
            {isLoggedIn && <button onClick={resetAuthCookies} >Logout</button>}
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
        map && clearMap(map, setCompletedCount, setPolylineClicked);
    }
}

export default Leaflet;
