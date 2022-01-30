export function getTriesAverage() {
    return parseInt(localStorage["triesSum"] || "0", 10) /
        parseInt(localStorage["tries"] || "1", 10);
}

export function addTryResult(n) {
    setTriesAverage(`${parseInt(localStorage["triesSum"] || "0", 10) + n}`,
        `${parseInt(localStorage["tries"] || "0", 10) + 1}`);
    return getTriesAverage();
}

export function setTriesAverage(sum, tires) {
    localStorage["triesSum"] = sum.toString();
    localStorage["tries"] = tires.toString();
}

export function setSettings(wordLen, difficulty){
    localStorage["wordLen"] = wordLen.toString();
    localStorage["difficulty"] = difficulty.toString()
}

export function getWordLen() {
    return parseInt(localStorage["wordLen"] || "5", 10);
}

export function getDifficulty() {
    return parseInt(localStorage["difficulty"] || "0", 10);
}