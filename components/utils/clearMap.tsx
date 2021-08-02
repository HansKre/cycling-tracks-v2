import L, {Map as LeafletMap} from 'leaflet';
import React from 'react';

/**
 * Removes all polylines but keeps attributions.
 */
function clearMap(
    map: LeafletMap,
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>,
    setPolylineClicked: React.Dispatch<React.SetStateAction<boolean>>) {
    map.eachLayer((layer: L.Layer) => {
        const hasEmptyContrib = !(layer.getAttribution && layer.getAttribution());
        const hasNoContrib = !layer.getAttribution;
        if (hasEmptyContrib || hasNoContrib) {
            map.removeLayer(layer);
        }
    });
    setCompletedCount(0);
    setPolylineClicked(false);
}

export default clearMap;