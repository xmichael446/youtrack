import {writable} from "svelte/store"

export const enrollment = writable({
    "full_name": null,
    "total_points": null,
    "rank": null
})

export const groupInfo = writable({
    "enrollments": null,
    "name": null
})

export const courseInfo = writable({
    "enrollments": null,
    "name": null
})
