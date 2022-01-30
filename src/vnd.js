import bridge from '@vkontakte/vk-bridge';

/*function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}*/

const vnd = {
    handleVictory: function () {
    },
    init: function () {
    },
    handleNewGame: function () {
    }
};

let vkEnable = true;// getParameterByName("vk");
if (vkEnable) {
    let gameNum = 0;
    let token = "";
    let userId = 0;

    vnd.init = async function () {
        await bridge.send('VKWebAppInit')
        const VKWebAppStorageGet = await bridge.send("VKWebAppStorageGet", {"keys": ["triesSum", "tries"]});
        (VKWebAppStorageGet.keys || []).forEach(v => {
            switch (v.key) {
                case "triesSum":
                    localStorage["triesSum"] = v.value;
                    break
                case "tries":
                    localStorage["tries"] = v.value;
                    break
            }
        })
        const VKWebAppGetUserInfo = await bridge.send("VKWebAppGetUserInfo");
        userId = VKWebAppGetUserInfo.id;

        const VKWebAppGetAuthToken = await bridge.send("VKWebAppGetAuthToken", {"app_id": 8061331, "scope": ""});
        token = VKWebAppGetAuthToken.access_token;
    };

    vnd.handleVictory = async function (newResult) {
        await bridge.send("VKWebAppStorageSet", {
            key: "score",
            value: newResult.toString()
        });


        let score = 10000 - Math.floor(newResult * 1000);
        await bridge.send("VKWebAppCallAPIMethod", {
            "method": "secure.addAppEvent",
            "request_id": Date.now().toString(),
            "params": {
                user_id: userId,
                activity_id: 2,
                value: score,
                access_token: token,
                v: "5.131",
            }
        });

        await bridge.send("VKWebAppShowLeaderBoardBox", {user_result: score})
    }

    vnd.handleNewGame = async function () {
        gameNum++;
        if (gameNum % 2 === 0) {
            await bridge.send("VKWebAppShowNativeAds", {ad_format: "interstitial"});
        }
    }
}

export default vnd;
