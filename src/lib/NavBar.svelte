<script>
    import {push, location} from "svelte-spa-router";
    import {onMount, onDestroy} from "svelte";
    import {fly, fade} from "svelte/transition";

    export let studentName;
    export let courseName;
    export let balance;

    let menuOpen = false;
    let menuRef;

    const navLinks = [
        {name: "Leaderboard", icon: "fa-regular fa-list-ol", tooltip: "Rankings", path: "/home/leaderboard"},
        {name: "Activity", icon: "fa-regular fa-list-check", tooltip: "Activity", path: "/home/activity"},
        {name: "Rewards", icon: "fa-regular fa-cart-shopping", tooltip: "Rewards", path: "/home/rewards"}
    ];

    function logout() {
        localStorage.clear();
        push("/");
    }

    function handleClickOutside(event) {
        if (menuRef && !menuRef.contains(event.target)) {
            menuOpen = false;
        }
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener("click", handleClickOutside);
    });

    function handleItemClick() {
        menuOpen = false;
    }
</script>

<nav class="navbar">
    <ul>
        <li><i class="fa-regular fa-user"></i> {studentName}</li>
        <li data-tooltip="Your course" data-placement="bottom">
            <i class="fa-regular fa-book"></i> {courseName}
        </li>
    </ul>

    <!-- Hamburger -->
    <button class="hamburger" onclick={(e) => { e.stopPropagation(); menuOpen = !menuOpen; }}>
        ☰
    </button>

    <!-- Right-side nav -->
    <ul bind:this={menuRef} class:open={menuOpen}>
        <li data-tooltip="Balance" data-placement="bottom">
            <i class="fa-regular fa-coin"></i>
            <b>Balance: </b> {balance} coins
        </li>

        {#each navLinks as item}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
            <li data-tooltip="{item.tooltip}" data-placement="bottom" onclick={handleItemClick}
                transition:fly={{ y: 10, duration: 200 }}>
                <i class="{item.icon}"></i>
                {#if $location === item.path}
                    <a href="#{item.path}" class="contrast">{item.name}</a>
                {:else}
                    <a href="#{item.path}">{item.name}</a>
                {/if}
            </li>
        {/each}

        <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_missing_attribute -->
        <li onclick={handleItemClick}>
            <a class="contrast logout-btn" onclick={logout}>
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </a>
        </li>
    </ul>
</nav>

<style>
    .navbar {
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
    }

    .logout-btn {
        cursor: pointer;
    }

    .hamburger {
        display: none;
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--contrast);
    }

    @media (max-width: 768px) {
        .hamburger {
            display: block;
        }

        .navbar > ul:last-child {
            display: none;
            position: absolute;
            top: 100%;
            right: 1rem;
            /* Solid adaptive background */
            background-color: var(--pico-background-color, #fff);
            border: 1px solid var(--muted-border-color, #ccc);
            border-radius: var(--border-radius, 6px);
            padding: 0.5rem 1rem;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.25s ease, transform 0.25s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Override for dark theme */
        @media (prefers-color-scheme: dark) {
            .navbar > ul:last-child {
                background-color: #1a1a1a; /* solid dark */
                border-color: #333;
            }
        }

        .navbar > ul:last-child.open {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }

        .navbar > ul:last-child li {
            display: block;
            margin: 0.5rem 0;
        }
    }

</style>
