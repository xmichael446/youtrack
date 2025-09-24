<script>
    import {availableRewards, claimedRewards} from "../stores/rewards.js";
    import {initialize, fetchRewards, claimReward} from "../api/rewards.js";
    import {onMount} from "svelte";
    import {enrollment} from "../stores/dashboard.js";
    import {fetchDashboard} from "../api/dashboard.js";

    let loading = null;
    let error = null;

    onMount(async () => {
        initialize({
            sCode: localStorage.getItem("student_code"),
            gCode: localStorage.getItem("group_code"),
        })

        error = await fetchRewards();
    })

    const handleClaim = async (rewardId) => {
        loading = rewardId;
        error = await claimReward({rewardId});
        await fetchDashboard({
            studentCode: localStorage.getItem("student_code"),
            groupCode: localStorage.getItem("group_code"),
        })
        loading = null;
    };
</script>

{#if $availableRewards || $claimedRewards}
    <hgroup>
        <h3>Rewards</h3>
        <p>Earn coins by attending lessons and submitting homework, exchange coins for rewards.</p>
    </hgroup>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Available Rewards -->
        <article class="shadow-md rounded-2xl p-4 bg-white">
            <header>
                <hgroup>
                    <h4><i class="fa-regular fa-gift"></i> Available Rewards</h4>
                    <p>Choose a reward you can claim with for gaining certain points.</p>
                </hgroup>
            </header>

            {#if $availableRewards.length > 0}
                <ul class="mt-4 space-y-3">
                    {#each $availableRewards as reward}
                        <li class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                            {#if $enrollment.balance >= reward.cost}
                                <div>
                                    <b>{reward.name}</b>
                                    <p><i class="fa-regular fa-coin"></i> Cost: <ins>{reward.cost} coins.</ins></p>
                                </div>
                                <button aria-busy="{loading === reward.id}" class="outline disabled:opacity-50" on:click={() => handleClaim(reward.id)}
                                        disabled={loading}>
                                    Buy
                                </button>
                            {:else}
                                <div>
                                    <b data-tooltip="{`Need ${reward.cost - $enrollment.balance} more coins`}">{reward.name}</b>
                                    <p>
                                        <i class="fa-regular fa-coin"></i> Cost: <ins>{reward.cost} coins.</ins>
                                        <br>
                                        <progress value="{$enrollment.balance}" max="{reward.cost}"></progress>
                                    </p>
                                </div>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-gray-500 mt-3">No rewards available at the moment.</p>
            {/if}
        </article>

        <!-- Claimed Rewards -->
        <article class="shadow-md rounded-2xl p-4 bg-white">
            <header>
                <hgroup>
                    <h4><i class="fa-regular fa-check-to-slot"></i> Claimed Rewards</h4>
                    <p>See the rewards you’ve already claimed.</p>
                </hgroup>
            </header>

            {#if $claimedRewards.length > 0}
                <ul class="mt-4 space-y-3">
                    {#each $claimedRewards as claim}
                        <li class="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div>
                                <b>{claim.reward.name}</b>
                                <p>
                                    Acquired on
                                    <u>
                                        {new Date(claim.awarded).toLocaleDateString()}
                                        at {new Date(claim.awarded).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </u>
                                </p>
                            </div>
                            <span class="font-medium">
                                {claim.reward.cost} coins
                            </span>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-gray-500 mt-3">You haven’t claimed any rewards yet.</p>
            {/if}
        </article>

    </div>

    {#if error}
        <p class="mt-4 text-red-600">{error}</p>
    {/if}
{/if}
