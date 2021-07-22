import {LatLngExpression, Map} from 'leaflet';
import React, {useState, useEffect} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import Activity from '../pages/api/types/outgoing/activity';
import ActivityPolyline from '../pages/api/types/outgoing/polyline';
import styles from './Leaflet.module.css';
const polyUtil = require('polyline-encoded');
import L, {LatLngBounds} from 'leaflet';
import ProgressBar from "@ramonak/react-progress-bar";
import Login from './Login';
import {useRouter} from 'next/router'

const randomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor;
}

const stuttgart = {lat: 48.783333, lng: 9.183333};

type PolylineWithActivity = {
    polyLine: LatLngExpression[];
    activity: Activity;
}

let maxBounds: LatLngBounds;

// cologne activities blacklisted to avoid to big map-maxBounds
const blacklistedActivities = [7019832827, 7008550301, 7019832827, 7022366656, 7013851476];

function Leaflet() {
    const [map, setMap] = useState<Map>();
    const [activities, setActivities] = useState<Activity[] | []>([]);
    const [completedCount, setCompletedCount] = useState<number>(0);

    useEffect(() => {
        for (const activity of activities.filter(a => !blacklistedActivities.includes(a.id))) {
            fetch(`/api/cycling/activities/polyline/${activity.id}`)
                .then(data => data.json())
                .then((json: ActivityPolyline) => {
                    setCompletedCount(prevState => prevState + 1);

                    const newLine: PolylineWithActivity = {
                        polyLine: polyUtil.decode(json.encodedPolyline),
                        activity: activity
                    }

                    // create polyline
                    const pathOptions = {color: randomColor(), weight: 5};
                    const polyline = L.polyline(newLine.polyLine, {color: randomColor(), weight: 5}).addTo(map);
                    // re-center map
                    if (maxBounds) {
                        const bounds = polyline.getBounds();
                        maxBounds = L.latLngBounds(
                            L.latLng(Math.min(maxBounds.getSouthWest().lat, bounds.getSouthWest().lat),
                                Math.min(maxBounds.getSouthWest().lng, bounds.getSouthWest().lng)),
                            L.latLng(Math.max(maxBounds.getNorthEast().lat, bounds.getNorthEast().lat),
                                Math.max(maxBounds.getNorthEast().lng, bounds.getNorthEast().lng))
                        )
                    } else {
                        maxBounds = polyline.getBounds();
                    }
                    console.log(JSON.stringify(maxBounds, null, 2));
                    map?.fitBounds(maxBounds);
                    // add on-hover
                    polyline.on('click', e => {
                        polyline.setStyle({weight: 9});
                        const popup = L.popup();
                        popup
                            .setLatLng(e.latlng)
                            .setContent(`${newLine.activity.id},
                            ${newLine.activity.startTime},
                            ${newLine.activity.distance}km,
                            ${newLine.activity.elevationGain}m,
                            ${newLine.activity.calories}kcal,
                            ${newLine.activity.duration}h`
                            )
                            .openOn(map);

                        // const invoicePDF = await http.download(`invoices/download/${rowData[7]}`);
                        // const url = window.URL.createObjectURL(new Blob([invoicePDF.data]));
                        // const link = document.createElement('a');
                        // link.href = url;
                        // document.body.appendChild(link);
                        // link.click();
                    });
                    // polyline.on('mouseout', e => {
                    //     polyline.setStyle({weight: 5});
                    //     map.closePopup();
                    // });
                })
                .catch(err => console.log(err, activity.id))
        }
    }, [activities])

    useEffect(() => {
        fetch('/api/cycling/activities')
            .then(data => data.json())
            .then((json: [Activity]) => setActivities(json))
            .catch(err => console.log(err))
    }, [])

    const completed = Math.round((completedCount / activities.length) * 100);
    const router = useRouter();
    return (
        <>
            <Login history={router} />
            <p>{`${completedCount} / ${activities.length}`}</p>
            <ProgressBar
                completed={completed ? completed : 0}
                borderRadius={'0px'}
                bgColor={'#696969'}
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
}

export default Leaflet