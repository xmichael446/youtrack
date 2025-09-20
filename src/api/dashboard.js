import {BASE_API_URL} from "../constants.js";
import {groupInfo, enrollment, courseInfo} from "../stores/dashboard.js";

export const fetchDashboard = async ({studentCode, groupCode}) => {
    const res = await fetch(`${BASE_API_URL}/api/dashboard/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({student_code: studentCode, group_code: groupCode}),
    });

    const resJSON = await res.json();
    if (!resJSON.success) {
        return resJSON.message;
    }

    const data = resJSON.data;

    enrollment.set(data.enrollment)
    groupInfo.set(data.group)
    courseInfo.set(data.course)
}