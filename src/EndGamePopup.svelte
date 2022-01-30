<script>
    import Popup from "./Popup.svelte";
    import {kStatusAbsent, kStatusCorrect, kStatusMisplaced, model} from "./model";
    import Button from "./Button.svelte";

    export let locale = {};

    function handleNextGameClick() {
        model.set($model.init($model.guessedWord.length, $model.field.length, $model.difficulty))
    }
</script>

{#if $model.victory || $model.defeat}
    <Popup>
        <div class="window">
            <div class="title">{$model.victory ? locale.victory : locale.defeat}</div>
            {#if $model.victory}
                <table>
                    {#each $model.field as row, j}
                        {#if j <= $model.currentRow}
                            <tr>
                                {#each row as c, i}
                                    <td
                                            class:absent="{$model.status[j][i] === kStatusAbsent}"
                                            class:misplaced={$model.status[j][i] === kStatusMisplaced}
                                            class:correct={$model.status[j][i] === kStatusCorrect}>{c}</td>
                                {/each}
                            </tr>
                        {/if}
                    {/each}
                </table>
                <div>{locale.averageTries}<span class="tries">{$model.averageTries.toFixed(2)}</span></div>
            {/if}
            {#if $model.defeat}
                <div>{locale.guessedWord}</div>
                <table>
                    <tr>
                        {#each $model.guessedWord as c}
                            <td class="correct defeat-word">{c}</td>
                        {/each}
                    </tr>
                </table>
            {/if}
            <div class="button">
                <Button on:click={handleNextGameClick}>{locale.nextGame}</Button>
            </div>
        </div>
    </Popup>
{/if}

<style>
    .window {
        display: flex;
        align-items: center;
        flex-direction: column;
        font-size: 2vh;
    }

    .title {
        font-size: 4vh;
        color: #5694b9;
        padding-bottom: 2vh;
    }

    .absent {
        background-color: #3d4042;
    }

    .misplaced {
        background-color: #8a6d34;
    }

    .correct {
        background-color: #52642b;
    }

    td {
        height: 3vh;
        width: 3vh;
        text-align: center;
        vertical-align: middle;
        text-transform: uppercase;
    }

    td.defeat-word {
        height: 5vh;
        width: 5vh;
        font-size: 3.5vh;
    }

    .button {
        margin-top: 6vh;
    }

    .title, .tries {
        font-size: 4vh;
        color: #5694b9;
    }
</style>