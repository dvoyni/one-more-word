<div class="popup" on:click>
    <div class="wrapper">
        <slot></slot>
    </div>
</div>

<style>
    .popup {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(44, 44, 44, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .wrapper {
        background-color: #2c2c2c;
        color: #b4b4b4;
        padding: 10vw;
        margin: 5vw;
        border: 3px solid #646464;
    }
</style>