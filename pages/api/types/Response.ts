import GarminActivity from "./incoming/garmin-activity";

type Response<BodyType = null> = {
    readonly status: number;
    readonly statusText: string;
    readonly body?: BodyType | null;
}

export default Response;