<script>
    export let enrollments = [];
    export let highlightStudent;

    $: isInList = enrollments.some(e => e.rank === highlightStudent?.rank);
</script>

<table class="striped">
    <thead class="bg-gray-100 text-gray-700 uppercase text-sm">
    <tr>
        <th class="px-4 py-2 text-left">Rank</th>
        <th class="px-4 py-2 text-left">Name</th>
        <th class="px-4 py-2 text-left">Points</th>
    </tr>
    </thead>
    <tbody>
    {#each enrollments as entry, i}
        {#if entry.rank === highlightStudent?.rank}
            <tr>
                <td>#{i + 1}</td>
                <td><mark data-tooltip="Your rank">{entry.full_name}</mark></td>
                <td>{entry.total_points}</td>
            </tr>
        {:else}
            <tr>
                <td>#{i + 1}</td>
                <td>{entry.full_name}</td>
                <td>{entry.total_points}</td>
            </tr>
        {/if}
    {/each}

    <!-- extra row if highlight student not in list -->
    {#if !isInList && highlightStudent}
        <tr>
            <td>#{highlightStudent.rank}</td>
            <td><mark>{highlightStudent.full_name}</mark></td>
            <td>{highlightStudent.total_points}</td>
        </tr>
    {/if}
    </tbody>
</table>

<style>
</style>
