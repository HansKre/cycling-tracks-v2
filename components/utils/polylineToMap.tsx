import L, {LatLngExpression, Map as LeafletMap, LeafletMouseEvent, LatLngBounds} from 'leaflet';
import React from 'react';
import Activity from '../../pages/api/types/outgoing/activity';
import randomColor from './randomColor';

let maxBounds: LatLngBounds;

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
    setPolylineClicked: React.Dispatch<React.SetStateAction<boolean>>) {
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

export default polylineToMap;