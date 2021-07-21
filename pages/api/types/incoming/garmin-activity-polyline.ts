interface GarminActivityPolyline {
    gPolyline: GPolyline;
}

interface GPolyline {
    numberOfPoints: number;
    activityId: number;
    encodedSamples: string;
    encodedLevels: string;
    maxLat: number;
    maxLon: number;
    minLat: number;
    minLon: number;
    startLat: number;
    startLon: number;
    endLat: number;
    endLon: number;
}

export default GarminActivityPolyline;
