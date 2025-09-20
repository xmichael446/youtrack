<script>
    import "../styles/dashboard.css";
    import {onMount} from "svelte";
    import TopPanel from "../lib/TopPanel.svelte";
    import {fetchDashboard} from "../api/dashboard.js";
    import Router, {push} from "svelte-spa-router";
    import {Card} from "flowbite-svelte"
    import {enrollment, groupInfo, courseInfo} from "../stores/dashboard.js"
    import Leaderboard from "../lib/Leaderboard.svelte";
    import {get} from "svelte/store";

    let isLoading = true;
    let errorMessage = null;

    onMount(async () => {
        try {
            const studentCode = localStorage.getItem("student_code");
            const groupCode = localStorage.getItem("group_code");

            if (!studentCode || !groupCode) push("/")

            errorMessage = await fetchDashboard({studentCode, groupCode})
        } catch (e) {
            console.error(e);
        } finally {
            isLoading = false;
        }
    });
    const routes = {
        "/leaderboard": Leaderboard
    }
    console.log(get(enrollment))
</script>

<main class="bg-gray-50 h-screen relative">

    {#if isLoading}
        <p class="text-center text-gray-500 text-lg mt-20">Loading dashboard...</p>
    {:else if errorMessage}
        <p class="text-center text-red-600 font-semibold mt-20">{errorMessage}</p>
    {:else if $enrollment}

        <!-- Fixed TopPanel -->
        <div class="fixed top-0 left-0 w-full z-10 bg-gray-50 shadow-md">
            <TopPanel
                    studentName={$enrollment.full_name}
                    courseName={$courseInfo.name}
            />
        </div>

        <!-- Scrollable content -->
        <div class="absolute top-[88px] left-0 right-0 bottom-0 overflow-auto">
            <Router prefix="/home" routes={routes}></Router>
        </div>

    {/if}
</main>