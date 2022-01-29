<script>
    import Popup from "./Popup.svelte";
    import {model} from "./model";

    export let locale = {};

    $: formatted = ($model.messageArgs || []).reduce((m, p, i) => m.replace(`$${i}`, p), locale[$model.message]);

    function onClick() {
        model.set($model.clearMessage())
    }
</script>

{#if $model.message}
    <Popup on:click={onClick}>
        <div class="window">
            {formatted}
        </div>
    </Popup>
{/if}

<style>
    .window {
        padding: 10vw;
        max-width: 80vw;
        background-color: wheat;
    }
</style>