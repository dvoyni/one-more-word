import bridge from '@vkontakte/vk-bridge';

const vnd = {
    handleVictory: function () {
    },
    init: function () {
    },
    handleNewGame: function () {
    }
};

if (vkEnable) {
    let gameNum = 0;
    let token = "f1e2c06df1e2c06df1e2c06d54f199c1feff1e2f1e2c06d9012c11b8ec7d9672b6b6b26";//?
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

        //const VKWebAppGetAuthToken = await bridge.send("VKWebAppGetAuthToken", {"app_id": 8061331, "scope": ""});
        //token = VKWebAppGetAuthToken.access_token;
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
