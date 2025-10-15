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

            if (errorMessage) {
                localStorage.clear()
                push("/")
            }
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
        <article class="text-center text-gray-500 text-lg mt-20" aria-busy="true">
            Loading dashboard...
        </article>
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
        <div class="absolute top-[88px] left-0 right-0 bottom-[40px] overflow-auto">
            <div class="container">
                <hgroup class="mb-8 text-center">
                    <h1>Welcome, {$enrollment.full_name}!</h1>
                    <p>
                        Here's your performance summary for the course
                        <span class="font-semibold">{$courseInfo.name}</span>.
                    </p>
                </hgroup>
                <Router prefix="/home" routes={routes}></Router>
            </div>
        </div>

        <!-- ✅ Fixed footer -->
        <footer class="developer-footer">
            <p class="developer-credit">
                Developed and maintained by
                <a href="https://t.me/Michael_IELTS" target="_blank" rel="noopener noreferrer">
                    Michael
                </a>
            </p>
        </footer>
    {/if}
</main>

<style>
    .developer-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: var(--pico-background-color);
        border-top: 1px solid var(--pico-muted-border-color);
        padding: 0.4rem 0;
        text-align: center;
        z-index: 20;
    }

    .developer-credit {
        margin: 0;
        font-size: 0.85rem;
        color: var(--pico-muted-color);
    }

    .developer-credit a {
        color: var(--pico-color);
        text-decoration: none;
        font-weight: 600;
    }

    .developer-credit a:hover {
        text-decoration: underline;
    }

</style>