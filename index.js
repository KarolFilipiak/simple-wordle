let API_VALIDATION_URL = "https://words.dev-apis.com/validate-word";
let API_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1";

let keyTiles = document.querySelectorAll(".input-character");

let row = 1;
let word = "";
let target = "";
let isLoading = false;

const setLoading = (loading) => {
    if (loading === 0) {
        isLoading = false;
        document.querySelector(".loading").style.visibility = "hidden";
    } else {
        isLoading = true;
        document.querySelector(".loading").style.visibility = "visible";
    }
}


async function isWord(str) {
    const promise = await fetch(API_VALIDATION_URL, {
        method: "POST",
        body: JSON.stringify({ "word" : str })
    });
    const response = await promise.json();
    return response.validWord;
}

const changeColors = () => {
    let toCheck = [0,1,2,3,4];
    let start = 5 * (row - 1);
    for (let i = 0; i < 5; i++) {
        console.debug(`word: ${target[i]}  |  input: ${keyTiles[i + start].textContent.toLowerCase()}`)
        if (target[i] == keyTiles[i + start].textContent.toLowerCase()){
            keyTiles[i + start].style.backgroundColor = "green";
            keyTiles[i + start].style.color = "white";
            const index = toCheck.indexOf(i);
            if (index > -1) { 
                toCheck.splice(index, 1); 
            }
        }
    }
    let wordRemainder = "";
    let targetRemainder = "";
    for (const x of toCheck) {
        wordRemainder += word[x]
        targetRemainder += target[x]
    }
    for (let i = 0; i < toCheck.length; i++) {
        for (let j = 0; j < toCheck.length; j++) {
            if (wordRemainder[i] === targetRemainder[j]) {
                keyTiles[toCheck[i] + start].style.backgroundColor = "orange";
                keyTiles[toCheck[i] + start].style.color = "white";
                targetRemainder = targetRemainder.substring(0,j) + targetRemainder.substring(j+1,targetRemainder.length);
                break;
            } else if (j == toCheck.length - 1) {
                keyTiles[toCheck[i] + start].style.backgroundColor = "gray";
                keyTiles[toCheck[i] + start].style.color = "white";
            }
        }
    }
}

function animateRow(row) {
    let id = null;
    let offset = 0;
    clearInterval(id);
    id = setInterval(frame, 5);

    function frame() {
        if (offset > 44) {
            for (let i = 0; i < 5; i++) {
                keyTiles[5 * (row-1) + i].style.borderColor = "lightgray";
            }
            offset = 0;
            clearInterval(id);
        } else {
            for (let i = 0; i < 5; i++) {
                keyTiles[5 * (row-1) + i].style.borderColor = `#${(255 - offset).toString(16)}${(Math.floor(offset * 4.8)).toString(16)}${(Math.floor(offset * 4.8)).toString(16)}`;
            }
            offset += 1;
        }
    }
}

function animateHeader() {
    let id = null;
    const e = document.querySelector(".title-style");
    let offset = 0;
    clearInterval(id);
    setInterval(frame, 5);

    function frame() {
        if (offset > 254) {
            offset = 0;
        } else {
            e.style.color = `rgb(${offset}, ${(offset + 80)%256}, ${(offset + 160)%256})`;
            offset++;
        }
    }
}

async function handleEnter () {
    if (word.length == 5) {
        setLoading(1);
        const iw = await isWord(word);
        setLoading(0);
        
        if (iw) {
            changeColors();
            if (word === target) {
                setLoading(0);
                setTimeout(function() { 
                    alert(`CONGRATULATIONS - YOU WON!!!!`);

                    animateHeader();
                }, 100);
                row = 8;
                word = "";
            }
            row += 1;
            word = "";

            if (row == 7) {
                setTimeout(function() { 
                    alert(`GAME OVER - CORRECT WORD WAS "${target.toUpperCase()}"`);
                }, 100);
            }
        } else {
            console.log("THIS IS NOT A VALID WORD");
            animateRow(row);
        }
        
        
    }
}

let handleBackspace = () => {
    if (word.length > 0) {
        keyTiles[5 * (row-1) + word.length - 1].textContent = "";
        word = word.substring(0, word.length - 1);
    } else {
        console.log("row empty");
    }
}

let isLetter = (key) => {
    return /^[a-zA-Z]$/.test(key);
}

let processInput = () => {
    document.addEventListener("keydown", (e) => {
        if (!isLoading && !e.repeat && row < 7) {
            console.log(`input: ${e.key}`);
            if (isLetter(e.key)) {
                if (word.length < 5) {
                    keyTiles[5 * (row-1) + word.length].textContent = e.key.toUpperCase();
                    word += e.key.toLowerCase();
                } else {
                    keyTiles[5 * (row-1) + word.length - 1].textContent = e.key.toUpperCase();
                    word = word.substring(0, word.length - 1) + e.key.toLowerCase();
                }

            } else if (e.key == "Backspace") {
                handleBackspace();

            } else if (e.key == "Enter") {
                handleEnter();
            }
        }
    });
}

async function getTarget() {
    const promise = await fetch(API_WORD_URL);
    const response = await promise.json();
    return response.word;
}

async function init() {
    setLoading(1);
    target = await getTarget();
    setLoading(0);
    console.log(`TARGET WORD: ${target}`)
    processInput();
}

init();