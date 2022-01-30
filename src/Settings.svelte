<script>
    import {kScreenGame, kScreenSettings, model} from "./model";
    import Button from "./Button.svelte";
    import {getDifficulty, getWordLen, setSettings} from "./storage";

    export let locale;

    let wordLength = getWordLen();
    let difficulty = getDifficulty();

    function handleClick() {
        setSettings(wordLength, difficulty);
        model.set($model.setScreen(kScreenGame))
        model.set($model.init(wordLength, 6, difficulty));
    }
</script>

{#if $model.screen === kScreenSettings}
    <div class="settings">
        <div class="title">{locale.settings}</div>
        <div>
            <p><label>{locale.wordLength}
                <select bind:value={wordLength} id="settings-length" onchange="setWordLen(this.value)">
                    <option value={5}>{locale.nLetters.replace("$0", "5")}</option>
                    <option value={6}>{locale.nLetters.replace("$0", "6")}</option>
                    <option value={7}>{locale.nLetters.replace("$0", "7")}</option>
                </select>
            </label>
            </p>
            <p>
            <div>{locale.difficulty}</div>
            <div><label>
                <input type="radio" bind:group={difficulty} name="difficulty" value={-1}/>{locale.difficultyNames[0]}
            </label></div>
            <div><label>
                <input type="radio" bind:group={difficulty} name="difficulty" value={0}/>{locale.difficultyNames[1]}
            </label></div>
            <div><label>
                <input type="radio" bind:group={difficulty} name="difficulty" value={1}/>{locale.difficultyNames[2]}
            </label></div>
        </div>
        <Button on:click={handleClick}>{locale.play}</Button>
    </div>
{/if}

<style>
    .settings {
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
</style>