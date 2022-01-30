<script>
    import Row from "./Row.svelte";

    export let model = {};

    let width = 0, height = 0;
    $: cellSize = Math.min(0.95 * width / model.field[0].length, height / model.field.length)

</script>

<div class="field" bind:clientWidth={width} bind:clientHeight={height}>
    {#each model.field as row, i}
        <Row value={row} index={i} size={cellSize} model={model}/>
    {/each}
</div>

<style>
    .field {
        height: 50vh;
        width: 100vw;
    }
</style>