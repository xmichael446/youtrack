<script>
    import {BASE_API_URL} from '../constants.js';
    import {push} from 'svelte-spa-router';
    import {onMount} from "svelte";

    let studentCode = '';
    let groupCode = '';


    let errorMessage = '';
    let isLoading = false;

    onMount(() => {
        const sCode = localStorage.getItem("student_code");
        if (sCode) push("/home/leaderboard")
    })

    async function handleLogin() {
        errorMessage = '';
        if (!studentCode.trim() || !groupCode.trim()) {
            errorMessage = "Please fill in everything!";
            return;
        }

        isLoading = true;

        try {
            const response = await fetch(`${BASE_API_URL}/api/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student_code: studentCode.trim(),
                    group_code: groupCode.trim(),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (!data.success) {
                    errorMessage = data.message || "Not found.";
                } else if (response.status === 400) {
                    errorMessage = "Missing required parameters.";
                } else {
                    errorMessage = "Error verifying candidate/test.";
                }
                return;
            }

            localStorage.setItem("group_code", groupCode.trim());
            localStorage.setItem("student_code", studentCode.trim());

            push("/home/leaderboard");

        } catch (err) {
            console.error(err);
            errorMessage = "Failed to connect to server. Try again later.";
        } finally {
            isLoading = false;
        }
    }
</script>


<div class="login-wrapper">
    <div class="login-box">
        <h2>Welcome to YouTrack!</h2>
        <input type="text" bind:value={studentCode} placeholder="Student Code"/>
        <input type="text" bind:value={groupCode} placeholder="Group Code"/>
        {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
        {/if}
        <button on:click={handleLogin} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Login'}
        </button>
    </div>
</div>

<style>
    .login-wrapper {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f5f5f5;
    }

    .login-box {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
        width: 300px;
    }

    .login-box h2 {
        margin-bottom: 1rem;
        text-align: center;
    }

    .login-box input, select {
        width: 100%;
        padding: 8px 10px;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 14px;
        background-color: white;
    }

    .login-box button {
        width: 100%;
        padding: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 15px;
    }

    .login-box button:hover {
        background: #45a049;
    }

    .error-message {
        color: red;
        font-size: 14px;
        margin-bottom: 1rem;
        text-align: center;
    }

    .login-box select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: white;
        border: 1px solid #ccc;
        color: #777;
        transition: border-color 0.2s ease;
    }

    /* When something is selected, use input text color */
    .login-box select.selected {
        color: #000;
    }

</style>

