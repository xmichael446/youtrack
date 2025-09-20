<script>
    import { push } from "svelte-spa-router";

    export let studentName;
    export let courseName;

    function logout() {
        localStorage.clear();
        push("/");
    }
</script>

<div class="flex flex-col md:flex-row justify-between items-center bg-white shadow-lg rounded-xl p-6 space-y-4 md:space-y-0 md:space-x-6">
    <div class="flex items-center space-x-8">
        <div>
            <p class="text-gray-500 text-sm">Student</p>
            <p class="text-xl font-bold"><i class="fa-solid fa-user mr-2"></i>{studentName}</p>
        </div>
        <div>
            <p class="text-gray-500 text-sm">Course</p>
            <p class="text-xl font-bold"><i class="fa-solid fa-graduation-cap mr-2"></i>{courseName}</p>
        </div>
    </div>

    <div class="flex items-center space-x-4">
        <button
                on:click={logout}
                class="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md flex items-center space-x-2
                   transition duration-200 ease-in-out
                   hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95"
        >
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
        </button>
    </div>
</div>
