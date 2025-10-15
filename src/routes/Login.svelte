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
    <article>
        <header>
            <div class="login-title">
                <strong>
                    Welcome to YouTrack!
                </strong>
            </div>
        </header>
        <form>
            <fieldset>
                <input type="text" bind:value={studentCode} placeholder="Student Code"/>
                <input type="text" bind:value={groupCode} placeholder="Group Code"/>
            </fieldset>
            {#if errorMessage}
                <small class="error-message">{errorMessage}</small>
            {/if}
        </form>
        <footer>
            <input type="submit" on:click={handleLogin} disabled={isLoading}
                   value={isLoading ? 'Verifying...' : 'Login to Dashboard'}>
        </footer>
    </article>

    <p class="developer-credit">
        Developed and maintained by
        <a href="https://t.me/Michael_IELTS" target="_blank" rel="noopener noreferrer">
            Michael
        </a>
    </p>
</div>


<style>
    .login-wrapper {
        width: 25rem;
        margin: 0 auto;
        padding-top: 4rem;
    }

    .login-title {
        text-align: center;
    }

    .error-message {
        text-align: center;
        color: red;
    }

    .developer-credit {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #777;
    }

    .developer-credit a {
        color: #0077b6;
        text-decoration: none;
        font-weight: 600;
    }

    .developer-credit a:hover {
        text-decoration: underline;
    }
</style>


