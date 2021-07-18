import Activity from "./activity";

interface ActivityDetails {
    polyLine: PolyLine[];
}

interface PolyLine {
    x: number;
    y: number;
}

export default ActivityDetails;