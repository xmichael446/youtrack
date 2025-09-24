import {availableRewards, claimedRewards} from "../stores/rewards.js";
import {sendRequest} from "./sender.js";

let studentCode;
let groupCode;

export const initialize = ({sCode, gCode}) => {
    studentCode = sCode;
    groupCode = gCode;
}

export const fetchRewards = async () => {
    const res = await sendRequest({
        path: "/api/rewards",
        body: {
            "student_code": studentCode,
            "group_code": groupCode
        }
    })

    if (!res.success) {
        return res.message;
    }

    availableRewards.set(res.data.available)
    claimedRewards.set(res.data.claimed.reverse())
}

export const claimReward = async ({rewardId}) => {
    const res = await sendRequest({
        path: "/api/rewards/claim",
        body: {
            "student_code": studentCode,
            "group_code": groupCode,
            "reward_id": rewardId,
        }
    })

    if (!res.success) {
        return res.message;
    }

    await fetchRewards()
}

