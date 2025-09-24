<script>
    import { enrollment, groupInfo, courseInfo } from "../stores/dashboard.js";
    import LeaderboardTable from "../lib/LeaderboardTable.svelte";
</script>

    {#if $enrollment}
        <hgroup>
            <h3>Leaderboard</h3>
            <p>
                Check your rankings in your group and across the entire course.
            </p>
        </hgroup>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article>
                <header>
                    <hgroup>
                        <h4>🏆 {$groupInfo.name} Ranking</h4>
                        <p class="mb-4">
                            Your rank among students in your group.
                        </p>
                    </hgroup>
                </header>

                <LeaderboardTable enrollments={$groupInfo.enrollments} highlightStudent={$enrollment}/>
            </article>

            <!-- Course Leaderboard Card -->
            <article>
                <header>
                    <hgroup>
                        <h4>🏆 Course Ranking</h4>
                        <p>
                            Your rank among all the students of <strong>{$courseInfo.name}</strong>.
                        </p>
                    </hgroup>
                </header>
                <LeaderboardTable enrollments={$courseInfo.enrollments} highlightStudent={$enrollment}/>
            </article>

        </div>
    {/if}
