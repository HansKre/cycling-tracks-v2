interface Activity {
    id: number;
    startTime: string;
    name: string;
    type: string;
    distance: number;
    duration: string;
    elevationGain: number;
    elevationLoss: number;
    averageSpeed: number;
    calories: number;
}

export default Activity;