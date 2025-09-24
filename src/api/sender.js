import {BASE_API_URL} from "../constants.js";

export const sendRequest = async ({path, body}) => {
    const res = await fetch(`${BASE_API_URL}${path}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })

    return await res.json();
}