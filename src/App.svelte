<script>
    import {onMount} from 'svelte';
    import Game from "./Game.svelte";
    import {createStore, kBsp, kRet, kScreenHelp, model} from "./model";
    import locale from "./ru";
    import MessagePopup from "./MessagePopup.svelte";
    import EndGamePopup from "./EndGamePopup.svelte";
    import vnd from "./vnd";
    import Help from "./Help.svelte";
    import Settings from "./Settings.svelte";
    import {getDifficulty, getWordLen} from "./storage";

    model.set(
        createStore(locale.dictionary, locale.keyboard)
            .init(getWordLen(), 6, getDifficulty())
    .setScreen(kScreenHelp));

    function handleKeydown(e) {
        let key = e.key;
        if (key === "Enter") {
            key = kRet;
        } else if (key === "Backspace") {
            key = kBsp;
        }
        model.set($model.insert(key));
    }

    onMount(async () => {
        vnd.init();
    })
</script>

<svelte:head>
    <title>{locale.title}</title>
    <meta charset="UTF-8">
    <title>Еще одно слово</title>
    <meta name="keywords" content="wordle, unlimited, русский, на русском, слова, игра">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimal-ui">
    <link rel="stylesheet" href="style.css">
    <!-- Yandex.Metrika counter -->
    <script type="text/javascript">
        (function (m, e, t, r, i, k, a) {
            m[i] = m[i] || function () {
                (m[i].a = m[i].a || []).push(arguments)
            };
            m[i].l = 1 * new Date();
            // noinspection CommaExpressionJS
            k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
        })
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(87246213, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true
        });
    </script>
    <noscript>
        <div><img src="https://mc.yandex.ru/watch/87246213" style="position:absolute; left:-9999px;" alt=""/></div>
    </noscript>
    <!-- /Yandex.Metrika counter -->
</svelte:head>

<svelte:window on:keydown={handleKeydown}/>

<Game {locale} version="b19"/>
<Help {locale}/>
<Settings {locale} />
<MessagePopup {locale}/>
<EndGamePopup {locale}/>

<style>
    :global(body) {
        height: 100%;
        padding: 0;
        margin: 0;
        overflow: hidden;
    }
</style>
