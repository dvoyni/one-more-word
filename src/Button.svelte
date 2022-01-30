<script>
    export let small = false;
</script>

<button on:click class:small>
    <slot></slot>
</button>

<style>
    button {
        font-size: 3vh;
        padding: 1.5vh;
        margin: 0;
        border: 3px solid #264050;
        background-color: rgba(86, 148, 185, 0.1);
        color: #5694b9;
        border-radius: 1vh;
    }

    .small {
        font-size: 1.5vh;
        padding: 0.75vh;
    }
</style>