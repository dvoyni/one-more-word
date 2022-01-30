import {writable} from 'svelte/store';
import {addTryResult, getTriesAverage} from "./storage";
import vnd from "./vnd";

export const model = writable({});

export const kRet = "\u23ce";
export const kBsp = "\u232b";

export const kMsgWordNotInDictionary = "kMsgWordNotInDictionary";
export const kMsgLetterMissed = "kMsgLetterMissed";
export const kMsgInsufficientLetter = "kMsgInsufficientLetter";
export const kMsgWrongLetterPosition = "kMsgWrongLetterPosition";

export const kScreenGame = 0;
export const kScreenHelp = 1;
export const kScreenSettings = 2;

export const kStatusUnknown = 0;
export const kStatusAbsent = 1;
export const kStatusMisplaced = 2;
export const kStatusCorrect = 3;
export const kStatusActive = 4;

export function createStore(dictionary, keyboard) {
    return {
        field: [],
        status: [],
        guessedWord: "",
        victory: false,
        defeat: false,
        currentWord: "",
        message: null,
        messageArgs: [],
        wordLen: 0,
        maxTries: 0,
        difficulty: 0,
        currentRow: 0,
        screen: kScreenGame,
        absentLetters: [],
        misplacedLetters: [],
        correctLetters: [],
        averageTries: 0,
        keyboard,

        init(wordLen, maxTries, difficulty) {
            this.difficulty = difficulty;
            const dict = dictionary[wordLen];
            this.guessedWord = dict[Math.floor(Math.random() * dict.length)];
            this.currentWord = "";
            this.currentRow = 0;
            this.defeat = false;
            this.victory = false;
            this.field = [...Array(maxTries)].map(_ => [...Array(wordLen)].map(_ => ""))
            this.status = [...Array(maxTries)].map(_ => [...Array(wordLen)].map(_ => kStatusUnknown))
            this.screen = kScreenGame;
            this.absentLetters = [];
            this.misplacedLetters = [];
            this.correctLetters = [];
            this._update();
            vnd.handleNewGame();
            return this;
        },

        insert(letter) {
            if (keyboard.indexOf(letter) < 0) {
                return this;
            }
            switch (letter) {
                case kRet:
                    this._testWord();
                    break;
                case kBsp:
                    if (this.currentWord.length > 0) {
                        this.field[this.currentRow][this.currentWord.length - 1] = "";
                    }
                    break;
                default:
                    if (this.currentWord.length < this.guessedWord.length) {
                        this._iterate((c, j, i) => ((this.field[j][i] = ((c === "_") ? letter : c)), (c === "_")));
                    }
                    break;
            }

            this._update();
            return this;
        },

        clearMessage() {
            this.message = null;
            this.messageArgs = [];
            return this;
        },

        setScreen(screen) {
            this.screen = screen;
            return this;
        },

        _update: function () {
            if (!this.victory && !this.defeat) {
                this._fillRequiredChars();
                this._updateCurrentWord();
                this._placeMarker();
            }
            this._updateStatus();
        },

        _placeMarker() {
            this._iterate((c, j, i) => (this.field[j][i] = (c === "_") ? "" : c) && false);
            this._iterate((c, j, i) =>
                ((this.field[j][i] = ((c === "" && j === this.currentRow) ? "_" : c)),
                    (c === "")));
        },

        _iterate(fn) {
            for (let j = 0; j < this.field.length; j++) {
                for (let i = 0; i < this.field[j].length; i++) {
                    if (fn(this.field[j][i], j, i)) {
                        return
                    }
                }
            }
        },

        _updateCurrentWord: function () {
            this.currentWord = this.field[this.currentRow].join("").replace("_", "");
        },

        _testWord() {
            if (this.currentWord.length !== this.guessedWord.length) {
                return;
            }

            if (this.difficulty >= 0) {
                if (dictionary[this.guessedWord.length].indexOf(this.currentWord) < 0) {
                    this.message = kMsgWordNotInDictionary;
                    this.messageArgs = [this.currentWord];
                    this._clearRow();
                    return;
                }
            }

            if (this.difficulty > 0) {
                for (let c of this.misplacedLetters) {
                    if (this.currentWord.indexOf(c) < 0) {
                        this.message = kMsgLetterMissed;
                        this.messageArgs = [c];
                        this._clearRow();
                        return;
                    }
                }
                for (let c of this.absentLetters) {
                    if (this.currentWord.indexOf(c) >= 0) {
                        this.message = kMsgInsufficientLetter;
                        this.messageArgs = [c];
                        this._clearRow();
                        return;
                    }
                }
                for (let i = 0; i < this.currentWord.length; i++) {
                    const c = this.currentWord[i];
                    if ((this.guessedWord[i] !== c) && (this.correctLetters.indexOf(c) >= 0)) {
                        for (let j = 0; j < this.currentRow; j++) {
                            if (this.field[j][i] === c) {
                                this.message = kMsgWrongLetterPosition;
                                this.messageArgs = [c];
                                this._clearRow();
                                return;
                            }
                        }
                    }
                }
            }

            this.currentRow++;
            if (!this.victory) {
                this.victory = this.currentWord === this.guessedWord;
                if (this.victory) {
                    const prev = getTriesAverage();
                    this.averageTries = addTryResult(this.currentRow);
                    vnd.handleVictory(this.averageTries, prev);
                }
            }
            this.defeat = !this.victory && this.currentRow >= this.field.length;
            this._updateLetters();
        },

        _clearRow() {
            const row = this.field[this.currentRow];
            for (let i = 0; i < row.length; i++) {
                row[i] = "";
            }
            this._update();
        },

        _fillRequiredChars() {
            if (this.difficulty > 0) {
                for (let row of this.field) {
                    for (let i = 0; i < row.length; i++) {
                        if (this.guessedWord[i] === row[i]) {
                            this.field[this.currentRow][i] = row[i];
                        }
                    }
                }
            }
        },

        _updateLetters() {
            this.absentLetters = [];
            this.misplacedLetters = [];
            this.correctLetters = [];

            for (let j = 0; j < this.currentRow; j++) {
                for (let i = 0; i < this.field[j].length; i++) {
                    const c = this.field[j][i];
                    if (this.guessedWord[i] === c) {
                        if (this.correctLetters.indexOf(c) < 0) {
                            this.correctLetters.push(c);
                        }
                    } else if (this.guessedWord.indexOf(c) >= 0) {
                        if (this.misplacedLetters.indexOf(c) < 0) {
                            this.misplacedLetters.push(c);
                        }
                    } else {
                        if (this.absentLetters.indexOf(c) < 0) {
                            this.absentLetters.push(c);
                        }
                    }
                }
            }
        },

        _updateStatus() {
            this._iterate((c, j, i) => {
                if (j >= this.currentRow) {
                    this.status[j][i] = kStatusUnknown;
                } else if (this.guessedWord[i] === c) {
                    this.status[j][i] = kStatusCorrect;
                } else if (this.guessedWord.indexOf(c) >= 0) {
                    this.status[j][i] = kStatusMisplaced;
                } else {
                    this.status[j][i] = kStatusAbsent;
                }
            })
        }
    }
}