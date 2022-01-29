<script>
    import Cell from "./Cell.svelte";

    export let value = [];
    export let index = 0;
    export let size = 0;
    export let model = {};
</script>

<div class="row" style={`height:${size}px`}>
    {#each value as cell, i}
        <Cell value={cell} size={size} status={model.status[index][i]}/>
    {/each}
</div>

<style>
    .row {
        text-align: center;
    }
</style>