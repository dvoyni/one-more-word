<script>
    import Button from "./Button.svelte";
    import {kScreenHelp, kScreenSettings, model} from "./model";

    export let locale = {};
    export let version;

    function handleInfoClick() {
        model.set($model.setScreen(kScreenHelp));
    }

    function handleSettingsClick() {
        model.set($model.setScreen(kScreenSettings));
    }
</script>

<div class="header">
    <Button on:click={handleInfoClick}>&#9432;</Button>
    <div class="title">{locale.title}<sup>{version}</sup></div>
    <Button on:click={handleSettingsClick}>&#9881;</Button>
</div>

<style>
    .header {
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .title {
        font-size: 2.5vh;
        color: #5694b9;
    }

    sup {
        font-size: 25%;
    }
</style>