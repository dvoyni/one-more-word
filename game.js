const keyboardTable = document.getElementById("keyboard");
const fieldTable = document.getElementById("field");
const victoryPanel = document.getElementById("victory");
const defeatPanel = document.getElementById("defeat");

const wordLen = parseInt(localStorage["word-length"] || "5", 10);
const difficulty = parseInt(localStorage["difficulty"] || "0", 10);
const maxTries = 6;
const kRet = "\u23ce";
const kBsp = "\u232b";
const keyboard = `йцукенгшщзх|фывапролджэ|${kBsp}ячсмитьбю${kRet}`;

let field = [...Array(maxTries)].map(_ => [...Array(wordLen)].map(_ => ""));
let currentRow = 0;
let won = false;
let gameNum = 0;

function nextGame() {
     field = [...Array(maxTries)].map(_ => [...Array(wordLen)].map(_ => ""));
     currentRow = 0;
     won = false;
    guessedWord = dictionary[wordLen][Math.floor(Math.random() * dictionary[wordLen].length)];
    updateKeyboard()
    updateField()
    document.getElementById("guessed-word").innerText = guessedWord;

    if (gameNum%2 === 1) {
        if (vkEnable) {
            vkBridge.send("VKWebAppShowNativeAds", {ad_format: "interstitial"})
                .then(data => console.log(data.result))
                .catch(error => console.log(error));
        }
    }
    gameNum++;
}

document.onkeydown = e => {
    let key = e.key;
    if (key === "Enter") {
        key = kRet;
    } else if (key === "Backspace") {
        key = kBsp;
    }
    onKeyClick(key)
}
updateKeyboard()
updateField()

if (!localStorage["helped"]) {
    help();
}

function updateKeyboard() {
    const defeat = !won && (currentRow >= maxTries);
    keyboardTable.style.display = (won || defeat) ? "none" : "";
    victoryPanel.style.display = won ? "flex" : "";
    defeatPanel.style.display = defeat ? "flex" : "";

    keyboardTable.innerHTML =
        keyboard.split("|").map(line => "<tr>" +
            line.split("").map(key => getKey(key)).join("\n")
            + "</tr>").join("\n");
}

function getKey(key) {
    let cls = "";

    for (let i = 0; i < currentRow; i++) {
        for (let j = 0; j < wordLen; j++) {
            const c = field[i][j];
            if (c === key) {
                if (guessedWord[j] === c) {
                    cls = "correct";
                }
                if (cls !== "correct" && guessedWord.indexOf(c) >= 0) {
                    cls = "misplaced";
                }
                if (cls === "") {
                    cls = "missed";
                }
            }
        }
    }

    if (key === kRet) {
        cls = (field[currentRow].join("").length !== wordLen) ? "dimmed" : "blink";
    }

    if (key === kBsp) {
        cls = (field[currentRow][0] === "") ? "dimmed" : "";
    }

    return `<td class="${cls}" onclick="onKeyClick('${key}')" class="key-btn">${key}</td>`;
}

function onKeyClick(key) {
    if (keyboard.indexOf(key) < 0) {
        return;
    }

    if ((won || currentRow >= maxTries) && key === kRet) {
        nextGame();
        return;
    }

    const row = field[currentRow];
    switch (key) {
        case kRet:
            checkWord(row.join(""))
            break;
        case kBsp:
            for (let i = 0; i < row.length; i++) {
                if (i === row.length - 1 || row[i + 1] === "") {
                    row[i] = "";
                    break;
                }
            }
            break;
        default:
            for (let i = 0; i < row.length; i++) {
                if (row[i] === "") {
                    row[i] = key;
                    break;
                }
            }
            break;
    }
    updateField();
    updateKeyboard();
}

function updateField() {
    fieldTable.innerHTML = field.map((row, j) =>
        `<tr>${row.map((c, i) => getLetter(c, i, j)).join("")}</tr>`).join("\n")
}

function getLetter(char, col, row) {
    const colorize = row < currentRow;
    let cls = colorize ? "missed" : "";
    if (colorize) {
        if (guessedWord[col] === char) {
            cls = "correct";
        } else if (guessedWord.indexOf(char) >= 0) {
            cls = "misplaced";
        }
    }
    if (char === "" && !won) {
        if (row === currentRow) {
            let filled = true;
            for (let i = 0; i < col; i++) {
                if (field[row][i] === "") {
                    filled = false;
                }
            }
            if (filled) {
                cls = "blink";
                char = "_";
            }
        }
    }
    return `<td class="${cls}">${char}</td>`;
}

function fillRequiredChars() {
    if (!won && currentRow < maxTries && difficulty > 0) {
        for (let row of field) {
            for (let i = 0; i < row.length; i++) {
                if (guessedWord[i] === row[i]) {
                    field[currentRow][i] = row[i];
                }
            }
        }
    }
}

function clearRow() {
    for (let i = 0; i < field[currentRow].length; i++) {
        field[currentRow][i] = "";
    }
}

function checkWord(word) {
    if (word.length !== wordLen) {
        return;
    }
    if (difficulty >= 0) {
        if (dictionary[wordLen].indexOf(word) < 0) {
            alert(`В словаре отсутствует слово «${word}»!`)
            clearRow();
            fillRequiredChars();
            return;
        }
    }

    if (difficulty > 0) {
        const required = [];
        const missed = [];
        for (let j = 0; j < currentRow; j++) {
            for (let c of field[j]) {
                if (guessedWord.indexOf(c) >= 0) {
                    required.push(c);
                } else {
                    missed.push(c);
                }
            }
        }
        for (let c of required) {
            if (word.indexOf(c) < 0) {
                alert(`Слово должно содержать букву «${c}»`);
                clearRow();
                fillRequiredChars();
                return;
            }
        }
        for (let c of missed) {
            if (word.indexOf(c) >= 0) {
                alert(`Слово не должно содержать букву «${c}»`);
                clearRow();
                fillRequiredChars();
                return;
            }
        }
        for (let i = 0; i < word.length; i++) {
            const c = word[i];
            if (guessedWord[i] !== c && required.indexOf(c) >= 0) {
                for (let j = 0; j < currentRow; j++) {
                    if (field[j][i] === c) {
                        alert(`Буква «${c}» не может стоять на этой позиции`);
                        clearRow();
                        fillRequiredChars();
                        return;
                    }
                }
            }
        }
    }

    currentRow++;
    won = word === guessedWord;

    fillRequiredChars();
}

function help() {
    document.getElementById("root").style.display = "none";
    document.getElementById("help").style.display = "flex";
    localStorage["helped"] = "true";
}

function settings() {
    document.getElementById("root").style.display = "none";
    document.getElementById("settings").style.display = "flex";
    document.getElementById("settings-length").value = localStorage["word-length"] || "5";
    document.querySelectorAll("input[name='difficulty']").forEach((input) => {
        input.addEventListener('change', setDifficulty);
        input.checked = input.value === difficulty.toString(10);
    });
}

function setWordLen(n) {
    localStorage["word-length"] = n;
}

function setDifficulty(n) {
    localStorage["difficulty"] = n.target.value;
}

let guessedWord = dictionary[wordLen][Math.floor(Math.random() * dictionary[wordLen].length)];
document.getElementById("guessed-word").innerText = guessedWord;
