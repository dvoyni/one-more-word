<script>
    import {kStatusAbsent, kStatusCorrect, kStatusMisplaced, kStatusUnknown} from "./model";

    export let value = "";
    export let size = 0;
    export let status = kStatusUnknown;
</script>

<div class="cell" style={`width:${size}px; height:${size}px; font-size:${size*0.75}px`}>
    <div class="inner"
         class:absent="{status === kStatusAbsent}"
         class:misplaced={status === kStatusMisplaced}
         class:correct={status === kStatusCorrect}
         class:blink={value === "_"}>
        <div>{value}</div>
    </div>
</div>
<style>
    .cell {
        box-sizing: border-box;
        padding: 2px;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .inner {
        position: absolute;
        top: 2px;
        bottom: 2px;
        left: 2px;
        right: 2px;
        border: 1px solid #3b3f41;
        text-transform: uppercase;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
    @keyframes blinker {
        50% {
            color: #323436;
        }
    }

    .blink {
        animation: blinker 1s linear infinite;
    }

</style>