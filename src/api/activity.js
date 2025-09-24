import {activity} from "../stores/activity.js";
import {sendRequest} from "./sender.js";

export const fetchActivities = async ({studentCode, groupCode}) => {
    console.log("ACTIVITIES");
    const res = await sendRequest({
        path: "/api/activities",
        body: {
            "student_code": studentCode,
            "group_code": groupCode
        }
    })

    if (!res.success) {
        return res.message;
    }

    activity.set(res.data)
}