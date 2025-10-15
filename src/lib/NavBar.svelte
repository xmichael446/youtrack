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
        {name: "Leaderboard", icon: "fa-regular fa-list-ol", path: "/home/leaderboard"},
        {name: "Activity", icon: "fa-regular fa-list-check", path: "/home/activity"},
        {name: "Rewards", icon: "fa-regular fa-cart-shopping", path: "/home/rewards"}
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

    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button class="hamburger" onclick={(e) => { e.stopPropagation(); menuOpen = !menuOpen; }}>
        {#if !menuOpen}
            <i in:fade={{ duration: 150 }} class="fa-solid fa-bars"></i>
        {:else}
            <i in:fade={{ duration: 150 }} class="fa-solid fa-xmark"></i>
        {/if}
    </button>

    <!-- Right-side nav -->
    <ul bind:this={menuRef} class:open={menuOpen}>
        <li data-tooltip="Balance" data-placement="bottom">
            <i class="fa-regular fa-coin"></i>
            <b>Balance: </b> {balance} coins
        </li>

        {#each navLinks as item}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
            <li data-placement="bottom" onclick={handleItemClick}
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
        background-color: var(--pico-card-background-color, var(--pico-background-color));
    }

    .navbar > ul {
        background-color: var(--pico-card-background-color, var(--pico-background-color));
        border-color: var(--pico-muted-border-color, #333);
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

    .hamburger:focus,
    .hamburger:focus-visible,
    .hamburger:focus:not(:focus-visible) {
        outline: none !important;
        box-shadow: none !important;
        border: none !important;
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
            background-color: var(--pico-background-color, #fff);
            border: 1px solid var(--pico-muted-border-color, #ccc);
            border-radius: var(--border-radius, 6px);
            padding: 0.5rem 1rem;
            z-index: 1000;
            opacity: 1;
            transform: translateY(-10px);
            transition: opacity 0.25s ease, transform 0.25s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
