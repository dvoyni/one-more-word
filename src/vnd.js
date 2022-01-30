import bridge from '@vkontakte/vk-bridge';

const vnd = {
    handleVictory: function () {
    },
    init: function () {
    },
    handleNewGame: function () {
    },
    buttons: [],
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

        const VKWebAppGetLaunchParams = await bridge.send("VKWebAppGetLaunchParams")
        if (VKWebAppGetLaunchParams.vk_platform !== "desktop_web") {
            window.body.style.paddingBottom = "10px";
        }

        //const VKWebAppGetAuthToken = await bridge.send("VKWebAppGetAuthToken", {"app_id": 8061331, "scope": ""});
        //token = VKWebAppGetAuthToken.access_token;
    };

    vnd.handleVictory = async function (newResult) {
        await bridge.send("VKWebAppStorageSet", {
            key: "triesSum",
            value: localStorage["triesSum"]
        });
        await bridge.send("VKWebAppStorageSet", {
            key: "tries",
            value: localStorage["tries"]
        });


        if (parseInt(localStorage["tries"], 10) >= 10) {
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
    }

    vnd.handleNewGame = async function () {
        gameNum++;
        if ((gameNum > 1) && (gameNum % 2 === 1)) {
            await bridge.send("VKWebAppShowNativeAds", {ad_format: "interstitial"});
        }
    }

    vnd.buttons = [
        {
            html: "Пригласить друзей",
            handle: async function () {
                bridge.send("VKWebAppShowInviteBox", {})
            }
        },
        {
            html: "Добавить игру в избранное",
            handle: async function () {
                bridge.send("VKWebAppAddToFavorites");
            }
        }
    ];
}

if (okEnable) {
    let gameNum = 0;

    vnd.init = async function () {
        var rParams = FAPI.Util.getRequestParameters();
        FAPI.init(rParams["api_server"], rParams["apiconnection"],
            function () {
                console.log("ok api initialized");
            },
            function (error) {
                console.log("ok api failed to initialize");
            }
        );
    };

    vnd.handleVictory = async function (newResult) {
        if (parseInt(localStorage["tries"], 10) >= 10) {

        }
    }

    vnd.handleNewGame = async function () {
        gameNum++;
        if ((gameNum > 1) && (gameNum % 2 === 1)) {
            FAPI.UI.showAd();
        }
    }

    vnd.buttons = [];
}

export default vnd;
