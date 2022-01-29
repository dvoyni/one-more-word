<script>
    import Field from "./Field.svelte";
    import Keyboard from "./Keyboard.svelte";
    import {kScreenGame, model} from "./model";
    import Header from "./Header.svelte";

    export let locale;
    export let version;

    function handleKeyClick(e) {
        model.set($model.insert(e.detail.key))
    }
</script>

{#if $model.screen === kScreenGame}
    <div class="game">
        <Header {locale} {version}/>
        <Field model={$model}/>
        <Keyboard model={$model} on:click={handleKeyClick}/>
    </div>
{/if}

<style>
    .game {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;

        background-color: #2c2c2c;
        color: #b4b4b4;
    }
</style>