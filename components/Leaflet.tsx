import {LatLngExpression, Map as LeafletMap} from 'leaflet';
import React, {useState, useEffect, useRef} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import Activity from '../pages/api/types/outgoing/activity';
import ActivityPolyline from '../pages/api/types/outgoing/polyline';
import styles from './Leaflet.module.css';
const polyUtil = require('polyline-encoded');
import ProgressBar from "@ramonak/react-progress-bar";
import Cookie from '../pages/api/types/incoming/Cookie';
import postRequest from './utils/postRequest';
import config from '../pages/api/config'
import {Typography, Slider, Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import clearMap from './utils/clearMap';
import polylineToMap from './utils/polylineToMap';

const stuttgart = {lat: 48.783333, lng: 9.183333};

// cologne activities blacklisted to avoid to big map-maxBounds
const blacklistedActivities = [7019832827, 7008550301, 7019832827, 7022366656, 7013851476];

type Props = {
    authCookies: Cookie[];
    onLogout: () => void;
    whileLoggingIn: (value: React.SetStateAction<boolean>) => void
}

function Leaflet(props: Props) {
    const {authCookies, onLogout, whileLoggingIn} = props;
    const [map, setMap] = useState<LeafletMap>();
    const [activities, setActivities] = useState<Activity[] | []>([]);
    const [filteredActivities, setFilteredActivities] = useState<Activity[] | []>([]);
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [polylineClicked, setPolylineClicked] = useState(false);
    const polylineClickedRef = useRef(polylineClicked);
    const [filters, setFilters] = useState({
        'preset-blacklist': (a: Activity) => !blacklistedActivities.includes(a.id)
    });
    const [minMaxDistance, setMinMaxDistance] = useState([0, 0]);
    const [minMaxDistanceVal, setMinMaxDistanceVal] = useState([0, 0]);

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
        if (map) {
            whileLoggingIn(true);
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
                .then((values) => whileLoggingIn(false))
                .catch((reason) => whileLoggingIn(false))
        }
    }, [filteredActivities])

    // fetch activities
    useEffect(() => {
        whileLoggingIn(true);
        const pendingRequest = postRequest(config.activitiesApiUrl, authCookies)
            .then(data => data.json())
            .then(({body}) => setActivities(body))
            .catch(err => {
                console.log(err);
                map && clearMap(map, setCompletedCount, setPolylineClicked);
                onLogout();
            })
            .finally(() => whileLoggingIn(false));
    }, [authCookies])

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
        return (
            <>
                <Grid item xs={2}>
                    <Typography id="range-slider" gutterBottom>
                        Distance range
                    </Typography>
                </Grid>
                <Grid item xs={10}>
                    <Slider
                        value={minMaxDistanceVal}
                        onChange={handleDistanceChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        getAriaValueText={(value) => `${value}m`}
                        min={minMaxDistance[0]}
                        max={minMaxDistance[1]}
                    />
                </Grid>
            </>
        )
    }

    const completed = Math.round((completedCount / filteredActivities.length) * 100);
    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            className={styles.mainGrid}
        >
            <Grid
                container
                className={styles.controlsContainerGrid}
            >
                <Grid
                    container
                    className={styles.filtersGrid}
                >
                    {distanceRangeSlider()}
                </Grid>
                <Grid
                    container
                    className={styles.controlsGrid}>
                    <Grid item xs={2}>
                        <Typography>{`${completedCount} / ${filteredActivities.length}`}</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <ProgressBar
                            completed={completed ? completed : 0}
                            borderRadius={'0px'}
                            bgColor={config.BG_COLOR}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid
                item
                container
                className={styles.mapGrid}
            >
                <MapContainer
                    className={styles.leafletMap}
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
            </Grid>
        </Grid>
    )
}

export default Leaflet;
