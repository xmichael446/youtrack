<script>
    import {activity} from "../stores/activity.js";
    import {fetchActivities} from "../api/activity.js";
    import {onMount} from "svelte";

    let error = null;

    onMount(async () => {
        console.log("MOUNTED")
        error = await fetchActivities({
            studentCode: localStorage.getItem("student_code"),
            groupCode: localStorage.getItem("group_code"),
        });
    });

    // Helper to make reason human-readable
    const formatReason = (reason) => {
        switch (reason) {
            case "ATTENDANCE":
                return "Attendance";
            case "HOMETASK":
                return "Homework";
            default:
                return reason;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
        const time = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        return `${date} at ${time}`;
    }
</script>

{#if $activity}
    <hgroup>
        <h3>Activity</h3>
        <p>Track your attendance, homework submissions, and the coins you’ve earned.</p>
    </hgroup>

    <article class="shadow-md rounded-2xl p-4 bg-white overflow-x-auto">
        <header>
            <hgroup>
                <h4><i class="fa-regular fa-list-check"></i> Recent Activity</h4>
                <p>Your most recent actions and rewards.</p>
            </hgroup>
        </header>

        {#if $activity.length > 0}
            <table class="w-full mt-4 border-collapse striped">
                <thead class="bg-gray-50 text-left">
                <tr>
                    <th class="px-3 py-2 border-b">#</th>
                    <th class="px-3 py-2 border-b">Timestamp</th>
                    <th class="px-3 py-2 border-b" data-tooltip="Why you earned said point?">Reason</th>
                    <th class="px-3 py-2 border-b text-right">Points</th>
                    <th class="px-3 py-2 border-b text-right">Coins</th>
                </tr>
                </thead>
                <tbody>
                {#each $activity as item, i}
                    <tr class="hover:bg-gray-50">
                        <td class="px-3 py-2 border-b text-right">{i + 1}</td>
                        <td class="px-3 py-2 border-b">{formatTimestamp(item.created_at)}</td>
                        <td class="px-3 py-2 border-b">{formatReason(item.reason)}</td>
                        <td class="px-3 py-2 border-b text-right">
                            <ins>+{item.points} XP</ins>
                        </td>
                        <td class="px-3 py-2 border-b text-right">
                            <ins>
                                +{item.coins} <i class="fa-regular fa-coin"></i>
                            </ins>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        {:else}
            <p class="text-gray-500 mt-3">No activities recorded yet.</p>
        {/if}
    </article>

    {#if error}
        <p class="mt-4 text-red-600">{error}</p>
    {/if}
{/if}
