<script>
    import { Card, Table } from "flowbite-svelte";

    export let title;
    export let enrollments = [];
    export let highlightStudent;

    // find if highlighted student exists in list
    $: isInList = enrollments.some(e => e.rank === highlightStudent?.rank);
</script>

<h2 class="text-xl font-bold mb-4">{title}</h2>
<div class="overflow-x-auto w-full">
    <Table hoverable class="w-full min-w-full">
        <thead class="bg-gray-100 text-gray-700 uppercase text-sm">
        <tr>
            <th class="px-4 py-2 text-left">Rank</th>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Points</th>
        </tr>
        </thead>
        <tbody>
        {#each enrollments as entry, i}
            <tr
                    class={`${
                        entry.rank === highlightStudent?.rank
                            ? "bg-blue-100 font-semibold"
                            : i % 2 === 0
                            ? "bg-gray-50"
                            : ""
                    }`}
            >
                <td class="px-4 py-2">#{i+1}</td>
                <td class="px-4 py-2">{entry.full_name}</td>
                <td class="px-4 py-2">{entry.total_points}</td>
            </tr>
        {/each}

        <!-- extra row if highlight student not in list -->
        {#if !isInList && highlightStudent}
            <tr class="bg-blue-50 font-semibold border-t-2 border-blue-300">
                <td class="px-4 py-2">#{highlightStudent.rank}</td>
                <td class="px-4 py-2">{highlightStudent.full_name}</td>
                <td class="px-4 py-2">{highlightStudent.total_points}</td>
            </tr>
        {/if}
        </tbody>
    </Table>
</div>
