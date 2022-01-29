<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let model = {};

    let width = 0, height = 0;
    $: keyWidth = Math.min(width / model.keyboard.split("|").reduce((p, row) => Math.max(p, row.length), 0), (height / 3) * 0.75);

    function handleClick(e) {
        dispatch('click', {key: e.target.dataset.key});
    }
</script>

<div class="keyboard" bind:clientWidth={width} bind:clientHeight={height}>
    {#each model.keyboard.split("|") as row}
        <div class="row">
            {#each row as key}
                <button class="key"
                        class:absent="{model.absentLetters.indexOf(key) >= 0}"
                        class:misplaced={model.misplacedLetters.indexOf(key) >= 0}
                        class:correct={model.correctLetters.indexOf(key) >= 0}
                        on:click={handleClick}
                        data-key="{key}"
                        style={`width:${keyWidth}px;font-size:${keyWidth * 0.5}px`}>
                    {key}
                </button>
            {/each}
        </div>
    {/each}
</div>

<style>
    .keyboard {
        height: 30vh;
        width: 100vw;
    }

    .row {
        height: 31%;
        text-align: center;
    }

    .key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        box-sizing: border-box;
        height: 100%;
        vertical-align: top;
        border: 1px solid #2c2c2c;
        background-color: #3b3f41;
        color: #b4b4b4;
        border-radius: 1vw;
    }

    .absent {
        background-color: #2c2c2c;
    }

    .misplaced {
        background-color: #8a6d34;
    }

    .correct {
        background-color: #52642b;
    }
</style>