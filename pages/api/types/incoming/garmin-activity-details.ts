interface GarminActivityDetail {
    activityId: number;
    measurementCount: number;
    metricsCount: number;
    metricDescriptors: MetricDescriptor[];
    activityDetailMetrics: ActivityDetailMetric[];
    geoPolylineDTO: GeoPolylineDTO;
    heartRateDTOs?: any;
    detailsAvailable: boolean;
}

interface GeoPolylineDTO {
    startPoint: StartPoint;
    endPoint: StartPoint;
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    polyline: StartPoint[];
}

interface StartPoint {
    lat: number;
    lon: number;
    altitude?: any;
    time: number;
    timerStart: boolean;
    timerStop: boolean;
    distanceFromPreviousPoint?: any;
    distanceInMeters?: any;
    speed: number;
    cumulativeAscent?: any;
    cumulativeDescent?: any;
    extendedCoordinate: boolean;
    valid: boolean;
}

interface ActivityDetailMetric {
    metrics: (null | number | number)[];
}

interface MetricDescriptor {
    metricsIndex: number;
    key: string;
    unit: Unit;
}

interface Unit {
    id: number;
    key: string;
    factor: number;
}

export default GarminActivityDetail;