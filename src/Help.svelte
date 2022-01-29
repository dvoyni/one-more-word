<script>
    import {kScreenGame, kScreenHelp, model} from "./model";
    import Button from "./Button.svelte";

    export let locale;

    function handleClick() {
        model.set($model.setScreen(kScreenGame))
    }
</script>

{#if $model.screen === kScreenHelp}
    <div class="help">
        <div class="title">{locale.title}</div>
        <div>
            {#each locale.help as l}
                {@html l}
            {/each}
        </div>
        <Button on:click={handleClick}>{locale.play}</Button>
    </div>
{/if}

<style>
    .help {
        width: 100%;
        height: 100%;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;

        background-color: #2c2c2c;
        color: #b4b4b4;
        padding: 10vw;
    }

    .title {
        font-size: 2.5vh;
        color: #5694b9;
    }

    :global(.help ul) {

    }

    :global(.help .misplaced) {
        background-color: #8a6d34;
        padding: 0 0.5em;
    }

    :global(.help .correct) {
        background-color: #52642b;
        padding: 0 0.5em;
    }
</style>