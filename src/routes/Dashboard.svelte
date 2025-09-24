<script>
    import "../styles/dashboard.css";
    import {onMount} from "svelte";
    import NavBar from "../lib/NavBar.svelte";
    import {fetchDashboard} from "../api/dashboard.js";
    import Router, {push} from "svelte-spa-router";
    import {enrollment, courseInfo} from "../stores/dashboard.js"
    import Leaderboard from "./Leaderboard.svelte";
    import {get} from "svelte/store";
    import Rewards from "./Rewards.svelte";
    import Activities from "./Activities.svelte";

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
        "/leaderboard": Leaderboard,
        "/rewards": Rewards,
        "/activity": Activities
    }
    console.log(get(enrollment))
</script>

<main class="container p-6 flex-1">

    {#if isLoading}
        <p class="text-center text-gray-500 text-lg mt-20">Loading dashboard...</p>
    {:else if errorMessage}
        <p class="text-center text-red-600 font-semibold mt-20">{errorMessage}</p>
    {:else if $enrollment}

        <!-- Fixed NavBar -->
        <div class="fixed top-0 left-0 w-full z-10 shadow-md">
            <NavBar
                    studentName={$enrollment.full_name}
                    courseName={$courseInfo.name}
                    balance={$enrollment.balance}
            />
        </div>

        <!-- Scrollable content -->
        <div class="absolute top-[88px] left-0 right-0 bottom-0 overflow-auto">
            <div class="container">
                <hgroup class="mb-8 text-center">
                    <h1>Welcome, {$enrollment.full_name}!</h1>
                    <p>
                        Here's your performance summary for the course <span class="font-semibold">{$courseInfo.name}</span>.
                    </p>
                </hgroup>
                <Router prefix="/home" routes={routes}></Router>
            </div>
        </div>

    {/if}
</main>