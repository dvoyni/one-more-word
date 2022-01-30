<script>
    import Popup from "./Popup.svelte";
    import {model} from "./model";
    import Button from "./Button.svelte";

    export let locale = {};

    $: formatted = ($model.messageArgs || []).reduce((m, p, i) => m.replace(`$${i}`, p), locale[$model.message]);

    function handleClick() {
        model.set($model.clearMessage())
    }
</script>

{#if $model.message}
    <Popup on:click={handleClick}>
        <div class="window">
            {formatted}
        </div>
        <div class="button">
            <Button on:click={handleClick}>{locale.ok}</Button>
        </div>
    </Popup>
{/if}

<style>
    .button {
        text-align: center;
        margin-top: 5vh;
    }
</style>