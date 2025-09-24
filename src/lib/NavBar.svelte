<script>
    import {push, location} from "svelte-spa-router";
    import {onMount} from "svelte";

    export let studentName;
    export let courseName;
    export let balance;

    const navLinks = [
        {
            name: "Leaderboard",
            icon: "fa-regular fa-list-ol",
            tooltip: "Rankings",
            path: "/home/leaderboard",
        },
        {
            name: "Activity",
            icon: "fa-regular fa-list-check",
            tooltip: "Rankings",
            path: "/home/activity",
        },
        {
            name: "Rewards",
            icon: "fa-regular fa-cart-shopping",
            tooltip: "Rankings",
            path: "/home/rewards",
        }
    ]

    function logout() {
        localStorage.clear();
        push("/");
    }

    onMount(() => {
        console.log(studentName, courseName, balance);
    })
</script>

<nav class="navbar">
    <ul>
        <li>
            <i class="fa-regular fa-user"></i> {studentName}
        </li>
        <li data-tooltip="Your course" data-placement="bottom">
            <i class="fa-regular fa-book"></i> {courseName}
        </li>
    </ul>
    <ul>
        <li data-tooltip="Balance" data-placement="bottom">
            <i class="fa-regular fa-coin"></i>
            {balance}
        </li>
        {#each navLinks as item}
            <li data-tooltip="{item.tooltip}" data-placement="bottom">
                <i class="{item.icon}"></i>
                {#if $location === item.path}
                    <a href="#{item.path}" class="contrast">{item.name}</a>
                {:else}
                    <a href="#{item.path}">{item.name}</a>
                {/if}
            </li>
        {/each}
        <li>
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_missing_attribute -->
            <a class="contrast logout-btn" onclick={logout}><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </li>
    </ul>
</nav>

<style>
    .navbar {
        padding: 0 1rem;
    }

    .logout-btn {
        cursor: pointer;
    }
</style>