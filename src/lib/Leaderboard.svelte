<script>
    import { enrollment, groupInfo, courseInfo } from "../stores/dashboard.js";
    import LeaderboardTable from "./LeaderboardTable.svelte";
</script>

<div class="p-6 flex-1 overflow-auto">
    {#if $enrollment}

        <!-- Page Header -->
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold mb-2">Welcome, {$enrollment.full_name}!</h1>
            <p class="text-gray-600">
                Here's your performance summary for the course <span class="font-semibold">{$courseInfo.name}</span>.
                <br>Check your rankings in your group and across the entire course.
            </p>
        </div>

        <!-- Leaderboards Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Group Leaderboard Card -->
            <div class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-semibold mb-2">🏆 {$groupInfo.name} Ranking</h2>
                <p class="text-gray-500 mb-4">
                    Your rank among students in your group.
                </p>
                <LeaderboardTable
                        title=""
                        enrollments={$groupInfo.enrollments}
                        highlightStudent={$enrollment}
                />
            </div>

            <!-- Course Leaderboard Card -->
            <div class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-semibold mb-2">🌍 Course Ranking</h2>
                <p class="text-gray-500 mb-4">
                    Your rank among all students in the course.
                </p>
                <LeaderboardTable
                        title=""
                        enrollments={$courseInfo.enrollments}
                        highlightStudent={$enrollment}
                />
            </div>

        </div>
    {/if}
</div>
