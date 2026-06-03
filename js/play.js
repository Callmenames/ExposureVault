/* =====================================================
   EXPOSURE VAULT
   PART 1
   STATE / LOAD / SAVE / STAGE SETUP / UI
===================================================== */

let gameData = null;

const STORAGE_KEY =
    "exposure-vault-save-v1";

/* ==========================================
   EVENT TABLES
========================================== */

const eventPools = [

    [
        ...Array(12).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(4).fill("SAFE"),
        ...Array(2).fill("DIFFUSE"),
        ...Array(1).fill("ALARM"),
        ...Array(1).fill("CAUTION")
    ],

    [
        ...Array(10).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(4).fill("SAFE"),
        ...Array(2).fill("DIFFUSE"),
        ...Array(3).fill("ALARM"),
        ...Array(2).fill("CAUTION")
    ],

    [
        ...Array(8).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(3).fill("SAFE"),
        ...Array(2).fill("DIFFUSE"),
        ...Array(5).fill("ALARM"),
        ...Array(3).fill("CAUTION")
    ],

    [
        ...Array(7).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(3).fill("SAFE"),
        ...Array(1).fill("DIFFUSE"),
        ...Array(7).fill("ALARM"),
        ...Array(4).fill("CAUTION")
    ],

    [
        ...Array(6).fill("HACK"),
        ...Array(2).fill("DECRYPT"),
        ...Array(2).fill("SAFE"),
        ...Array(1).fill("DIFFUSE"),
        ...Array(9).fill("ALARM"),
        ...Array(5).fill("CAUTION")
    ]

];

/* ==========================================
   GAME STATE
========================================== */

let currentStage = 0;

let password = "";
let revealedPassword = "";

let alarms = 0;
let maxAlarms = 0;

let secretCode = "";

let currentInput = "";

let unlockedImages = [];

let processing = false;

/* ==========================================
   INIT
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init(){

    const hash =
        location.hash.replace(
            "#",
            ""
        );

    if(!hash){

        document.getElementById(
            "loadingScreen"
        ).innerHTML =
        "<h2>No vault data found.</h2>";

        return;

    }

    try{

        const json =
            LZString.decompressFromEncodedURIComponent(
                hash
            );

        gameData =
            JSON.parse(
                json
            );

        loadProgress();

    }
    catch(err){

        console.error(err);

        document.getElementById(
            "loadingScreen"
        ).innerHTML =
        "<h2>Invalid vault link.</h2>";

    }

}

/* ==========================================
   SAVE SYSTEM
========================================== */

function saveProgress(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            hash:
                location.hash,

            currentStage,

            password,

            revealedPassword,

            alarms,

            maxAlarms,

            secretCode,

            unlockedImages

        })

    );

}

function loadProgress(){

    const save =
        localStorage.getItem(
            STORAGE_KEY
        );

    if(save){

        try{

            const data =
                JSON.parse(
                    save
                );

            if(
                data.hash ===
                location.hash
            ){

                currentStage =
                    data.currentStage || 0;

                password =
                    data.password || "";

                revealedPassword =
                    data.revealedPassword || "";

                alarms =
                    data.alarms || 0;

                maxAlarms =
                    data.maxAlarms || 0;

                secretCode =
                    data.secretCode || "";

                unlockedImages =
                    data.unlockedImages || [];

            }

        }
        catch(err){

            console.log(err);

        }

    }

    document
        .getElementById(
            "loadingScreen"
        )
        .classList.add(
            "hidden"
        );

    if(password === ""){

        showCover();

    }
    else{

        startGameUI();

    }

}

/* ==========================================
   COVER
========================================== */

function showCover(){

    document
        .getElementById(
            "coverScreen"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "coverImage"
        ).src =
        gameData.cover;

}

function startGame(){

    currentStage = 0;

    unlockedImages = [];

    loadStage();

    document
        .getElementById(
            "coverScreen"
        )
        .classList.add(
            "hidden"
        );

    startGameUI();

}

function startGameUI(){

    document
        .getElementById(
            "gameScreen"
        )
        .classList.remove(
            "hidden"
        );

    renderGallery();

    updateUI();

}

/* ==========================================
   STAGE SETUP
========================================== */

function loadStage(){

    const stage =
        gameData.stages[
            currentStage
        ];

    password =
        (stage.password || "")
        .toUpperCase();

    revealedPassword =
        buildHiddenPassword(
            password
        );

    maxAlarms =
        calculateAlarms(
            password.length,
            stage.difficulty
        );

    alarms =
        maxAlarms;

    generateNewCode();

    currentInput = "";

    saveProgress();

}

function calculateAlarms(
    length,
    difficulty
){

    switch(
        difficulty
    ){

        case "hard":
            return Math.ceil(
                length * 0.5
            );

        case "medium":
            return Math.ceil(
                length * 0.75
            );

        default:
            return length;

    }

}

function buildHiddenPassword(
    text
){

    return text
        .split("")
        .map(char=>{

            if(
                char === " "
            ){
                return " ";
            }

            return "*";

        })
        .join("");

}

function generateNewCode(){

    secretCode = "";

    for(
        let i = 0;
        i < 4;
        i++
    ){

        secretCode +=
            Math.floor(
                Math.random() * 10
            );

    }

}

/* ==========================================
   UI
========================================== */

function updateUI(){

    const stage =
        gameData.stages[
            currentStage
        ];

    document
        .getElementById(
            "stageTitle"
        )
        .textContent =

        `Stage ${
            currentStage + 1
        } / ${
            gameData.stages.length
        }`;

    document
        .getElementById(
            "difficultyDisplay"
        )
        .textContent =
        (
            stage.difficulty ||
            "easy"
        ).toUpperCase();

    document
        .getElementById(
            "vaultImage"
        ).src =
        stage.image;

    document
        .getElementById(
            "passwordDisplay"
        )
        .textContent =
        revealedPassword;

    document
        .getElementById(
            "codeDisplay"
        )
        .textContent =

        currentInput.padEnd(
            4,
            "-"
        );

    renderAlarms();

}

function renderAlarms(){

    const container =
        document.getElementById(
            "alarmContainer"
        );

    container.innerHTML = "";

    for(
        let i = 0;
        i < alarms;
        i++
    ){

        const dot =
            document.createElement(
                "div"
            );

        dot.className =
            "alarm";

        container.appendChild(
            dot
        );

    }

}

/* ==========================================
   KEYPAD
========================================== */

function pressDigit(
    digit
){

    if(processing){
        return;
    }

    if(
        currentInput.length >= 4
    ){
        return;
    }

    currentInput += digit;

    updateUI();

}

/* =====================================================
   PART 2
   HACK SYSTEM / PROGRESS BAR / MASTERMIND
===================================================== */

/* ==========================================
   HACK BUTTON
========================================== */

function hack(){

    if(processing){
        return;
    }

    if(
        currentInput.length !== 4
    ){

        setResult(
            "ENTER 4 DIGITS"
        );

        return;

    }

    processing = true;

    const button =
        document.getElementById(
            "hackButton"
        );

    if(button){
        button.disabled = true;
    }

    runProgressBar(
        ()=>{
            processHack();
        }
    );

}

/* ==========================================
   PROGRESS BAR
========================================== */

function runProgressBar(
    callback
){

    const fill =
        document.getElementById(
            "progressFill"
        );

    fill.style.transition =
        "none";

    fill.style.width =
        "0%";

    setTimeout(()=>{

        fill.style.transition =
            "width 1s linear";

        fill.style.width =
            "100%";

    },10);

    setTimeout(()=>{

        fill.style.transition =
            "none";

        fill.style.width =
            "0%";

        callback();

    },1000);

}

/* ==========================================
   PROCESS HACK
========================================== */

function processHack(){

    const guess =
        currentInput;

    currentInput = "";

    updateUI();

    const hints =
        buildHints(
            guess,
            secretCode
        );

    renderHints(
        hints
    );

    addHistoryEntry(
        guess,
        hints
    );

    if(
        guess ===
        secretCode
    ){

        codeCracked();

    }
    else{

        rollEvent();

    }

    saveProgress();

}

/* ==========================================
   MASTERMIND LOGIC
========================================== */

function buildHints(
    guess,
    code
){

    const hints = [];

    const guessArr =
        guess.split("");

    const codeArr =
        code.split("");

    const usedGuess =
        Array(4).fill(
            false
        );

    const usedCode =
        Array(4).fill(
            false
        );

    /* GREEN PASS */

    for(
        let i = 0;
        i < 4;
        i++
    ){

        if(
            guessArr[i] ===
            codeArr[i]
        ){

            hints[i] =
                "GREEN";

            usedGuess[i] =
                true;

            usedCode[i] =
                true;

        }

    }

    /* YELLOW PASS */

    for(
        let i = 0;
        i < 4;
        i++
    ){

        if(
            usedGuess[i]
        ){
            continue;
        }

        for(
            let j = 0;
            j < 4;
            j++
        ){

            if(
                usedCode[j]
            ){
                continue;
            }

            if(
                guessArr[i] ===
                codeArr[j]
            ){

                hints[i] =
                    "YELLOW";

                usedGuess[i] =
                    true;

                usedCode[j] =
                    true;

                break;

            }

        }

    }

    /* GREY PASS */

    for(
        let i = 0;
        i < 4;
        i++
    ){

        if(
            !hints[i]
        ){

            hints[i] =
                "GREY";

        }

    }

    return hints;

}

/* ==========================================
   HINT DISPLAY
========================================== */

function renderHints(
    hints
){

    const row =
        document.getElementById(
            "hintRow"
        );

    if(!row){
        return;
    }

    row.innerHTML = "";

    hints.forEach(
        colour=>{

            const dot =
                document.createElement(
                    "div"
                );

            dot.className =
          "hint " +
          colour.toLowerCase();

            row.appendChild(
                dot
            );

        }
    );

}

/* ==========================================
   ACCESS LOG
========================================== */

function addHistoryEntry(
    guess,
    hints
){

    const history =
        document.getElementById(
            "historyList"
        );

    if(!history){
        return;
    }

    const entry =
        document.createElement(
            "div"
        );

    entry.className =
        "historyEntry";

    const hintHTML =
        hints.map(
            hint=>{

                if(
                    hint === "GREEN"
                ){
                    return
                    "<span class='green'>●</span>";
                }

                if(
                    hint === "YELLOW"
                ){
                    return
                    "<span class='yellow'>●</span>";
                }

                return
                "<span class='grey'>●</span>";

            }
        ).join("");

    entry.innerHTML =

        `<span>${guess}</span>
         <span>${hintHTML}</span>`;

    history.prepend(
        entry
    );

}

/* ==========================================
   CODE CRACKED
========================================== */

function codeCracked(){

    revealRandomLetters(
        3
    );

    generateNewCode();

    updateUI();

    setResult(
        "CODE CRACKED • 3 LETTERS REVEALED"
    );

    checkPasswordSolved();

}

/* ==========================================
   RANDOM EVENT ROLL
========================================== */

function rollEvent(){

    const pool =
        eventPools[
            Math.min(
                currentStage,
                4
            )
        ];

    const result =

        pool[
            Math.floor(
                Math.random()
                *
                pool.length
            )
        ];

    resolveEvent(
        result
    );

}

/* =====================================================
   PART 3
   EVENTS / PASSWORD / STAGES / VICTORY
===================================================== */

/* ==========================================
   EVENTS
========================================== */

function resolveEvent(
    eventType
){

    switch(
        eventType
    ){

        case "HACK":

            revealRandomLetters(
                1
            );

            setResult(
                "HACK SUCCESS"
            );

            break;

        case "DECRYPT":

            revealRandomLetters(
                3
            );

            setResult(
                "DECRYPT SUCCESS"
            );

            break;

        case "SAFE":

            setResult(
                "SAFE"
            );

            break;

        case "ALARM":

            alarms--;

            setResult(
                "ALARM TRIGGERED"
            );

            break;

        case "DIFFUSE":

            alarms++;

            setResult(
                "ALARM DEACTIVATED"
            );

            break;

        case "CAUTION":

            processCaution();

            break;

    }

    updateUI();

    saveProgress();

    checkPasswordSolved();

    checkLockdown();

}

/* ==========================================
   CAUTION
========================================== */

function processCaution(){

    const pool =
        eventPools[
            Math.min(
                currentStage,
                4
            )
        ];

    const nextResult =

        pool[
            Math.floor(
                Math.random()
                *
                pool.length
            )
        ];

    if(
        nextResult ===
        "ALARM"
    ){

        alarms -= 3;

        if(
            alarms < 0
        ){
            alarms = 0;
        }

        setResult(
            "CAUTION FAILED • -3 ALARMS"
        );

    }
    else{

        setResult(
            "CAUTION CLEARED"
        );

    }

}

/* ==========================================
   LETTER REVEALS
========================================== */

function revealRandomLetters(
    amount
){

    const hidden = [];

    for(
        let i = 0;
        i < password.length;
        i++
    ){

        if(
            revealedPassword[i]
            === "*"
        ){

            hidden.push(
                i
            );

        }

    }

    if(
        hidden.length === 0
    ){
        return;
    }

    const chars =
        revealedPassword
        .split("");

    for(
        let x = 0;
        x < amount;
        x++
    ){

        if(
            hidden.length === 0
        ){
            break;
        }

        const randomIndex =
            Math.floor(
                Math.random()
                *
                hidden.length
            );

        const position =
            hidden[
                randomIndex
            ];

        chars[position] =
            password[position];

        hidden.splice(
            randomIndex,
            1
        );

    }

    revealedPassword =
        chars.join("");

}

/* ==========================================
   RESULT DISPLAY
========================================== */

function setResult(
    text
){

    const box =
        document.getElementById(
            "resultBox"
        );

    box.style.opacity =
        "1";

    box.textContent =
        text;

    setTimeout(()=>{

        box.style.opacity =
            "0";

    },1500);

    setTimeout(()=>{

        box.textContent =
            "";

        box.style.opacity =
            "1";

        processing =
            false;

        const button =
            document.getElementById(
                "hackButton"
            );

        if(button){

            button.disabled =
                false;

        }

    },2000);

}

/* ==========================================
   PASSWORD COMPLETE
========================================== */

function checkPasswordSolved(){

    if(
        revealedPassword !==
        password
    ){
        return;
    }

    setTimeout(()=>{

        stageComplete();

    },1000);

}

/* ==========================================
   LOCKDOWN
========================================== */

function checkLockdown(){

    if(
        alarms > 0
    ){
        return;
    }

    setTimeout(()=>{

        stageReset();

    },1000);

}

/* ==========================================
   STAGE COMPLETE
========================================== */

function stageComplete(){

    document
        .getElementById(
            "gameScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "stageCompleteScreen"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "revealedImage"
        ).src =

        gameData.stages[
            currentStage
        ].image;

}

function continueAfterReveal(){

    unlockedImages.push(

        gameData.stages[
            currentStage
        ].image

    );

    currentStage++;

    saveProgress();

    if(
        currentStage >=
        gameData.stages.length
    ){

        showVictory();

        return;

    }

    loadStage();

    renderGallery();

    updateUI();

    document
        .getElementById(
            "stageCompleteScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "gameScreen"
        )
        .classList.remove(
            "hidden"
        );

}

/* ==========================================
   LOCKDOWN SCREEN
========================================== */

function stageReset(){

    document
        .getElementById(
            "gameScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "resetScreen"
        )
        .classList.remove(
            "hidden"
        );

}

function continueAfterReset(){

    loadStage();

    updateUI();

    const history =
        document.getElementById(
            "historyList"
        );

    if(history){
        history.innerHTML = "";
    }

    const hintRow =
        document.getElementById(
            "hintRow"
        );

    if(hintRow){
        hintRow.innerHTML = "";
    }

    document
        .getElementById(
            "resetScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "gameScreen"
        )
        .classList.remove(
            "hidden"
        );

}

/* ==========================================
   GALLERY
========================================== */

function renderGallery(){

    const galleryCard =
        document.getElementById(
            "galleryCard"
        );

    const gallery =
        document.getElementById(
            "gallery"
        );

    if(
        !gallery ||
        !galleryCard
    ){
        return;
    }

    gallery.innerHTML = "";

    if(
        unlockedImages.length === 0
    ){

        galleryCard
            .classList.add(
                "hidden"
            );

        return;

    }

    galleryCard
        .classList.remove(
            "hidden"
        );

    unlockedImages.forEach(

        src=>{

            const img =
                document.createElement(
                    "img"
                );

            img.src =
                src;

            gallery.appendChild(
                img
            );

        }

    );

}

/* ==========================================
   VICTORY
========================================== */

function showVictory(){

    localStorage.removeItem(
        STORAGE_KEY
    );

    document
        .getElementById(
            "gameScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "stageCompleteScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "resetScreen"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "victoryScreen"
        )
        .classList.remove(
            "hidden"
        );

    if(
        gameData.bonus
    ){

        document
            .getElementById(
                "bonusImage"
            ).src =
            gameData.bonus;

    }

    const gallery =
        document.getElementById(
            "finalGallery"
        );

    gallery.innerHTML = "";

    const images = [

        gameData.cover,

        ...unlockedImages

    ];

    if(
        gameData.bonus
    ){

        images.push(
            gameData.bonus
        );

    }

    images.forEach(

        src=>{

            const img =
                document.createElement(
                    "img"
                );

            img.src =
                src;

            gallery.appendChild(
                img
            );

        }

    );

}

/* ==========================================
   AUTOSAVE
========================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        saveProgress();

    }

);

function clearCode(){

    if(processing){
        return;
    }

    currentInput = "";

    updateUI();

}
