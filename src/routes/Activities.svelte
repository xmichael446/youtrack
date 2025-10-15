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


    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp).toLocaleDateString("en-US", {month: "short", day: "numeric"});
        return `${date}`;
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
                    <th class="px-3 py-2 border-b">Date</th>
                    <th class="px-3 py-2 border-b">Action</th>
                    <th class="px-3 py-2 border-b text-right">XP Change</th>
                    <th class="px-3 py-2 border-b text-right">Coin Change</th>
                </tr>
                </thead>
                <tbody>
                {#each $activity as item}
                    <tr class:danger-row={item.action === 'Blacklist'}>
                        <td class="px-3 py-2 border-b">{@html formatTimestamp(item.for_date)}</td>
                        <td class="px-3 py-2 border-b">{item.action}</td>
                        <td class="px-3 py-2 border-b text-right">
                            {#if item.points > 0}
                                <ins>+{item.points} XP</ins>
                            {:else}
                                N/A
                            {/if}
                        </td>
                        <td class="px-3 py-2 border-b text-right">
                            {#if item.coins_change > 0}
                                <ins>
                                    +{item.coins_change} <i class="fa-regular fa-coin"></i>
                                </ins>
                            {:else}
                                <ins class="balance-negative">
                                    {item.coins_change} <i class="fa-regular fa-coin"></i>
                                </ins>
                            {/if}
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

<style>
    .balance-negative {
        color: #F06048;
    }

    .danger-row {
        background-color: rgba(255, 0, 0, 0.08);
        color: var(--pico-color-danger);
    }

    [data-theme="dark"] .danger-row {
        background-color: rgba(255, 60, 60, 0.15);
        color: var(--pico-color-danger);
    }

</style>