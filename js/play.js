/* =====================================================
   EXPOSURE VAULT
   PART 1
   Core State / Loading / Saving / Stage Setup
===================================================== */

let gameData = null;

const STORAGE_KEY =
    "exposure-vault-save-v1";

/* ==========================================
   STAGE EVENT TABLES
========================================== */

const eventPools = [

    // Stage 1

    [
        ...Array(12).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(4).fill("SAFE"),
        ...Array(2).fill("DIFFUSE"),
        ...Array(1).fill("ALARM"),
        ...Array(1).fill("CAUTION")
    ],

    // Stage 2

    [
        ...Array(10).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(4).fill("SAFE"),
        ...Array(2).fill("DIFFUSE"),
        ...Array(3).fill("ALARM"),
        ...Array(2).fill("CAUTION")
    ],

    // Stage 3

    [
        ...Array(8).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(3).fill("SAFE"),
        ...Array(2).fill("DIFFUSE"),
        ...Array(5).fill("ALARM"),
        ...Array(3).fill("CAUTION")
    ],

    // Stage 4

    [
        ...Array(7).fill("HACK"),
        ...Array(3).fill("DECRYPT"),
        ...Array(3).fill("SAFE"),
        ...Array(1).fill("DIFFUSE"),
        ...Array(7).fill("ALARM"),
        ...Array(4).fill("CAUTION")
    ],

    // Stage 5

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
            LZString
            .decompressFromEncodedURIComponent(
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
        (
            stage.password || ""
        ).toUpperCase();

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

/* =====================================================
   PART 2
   UI / KEYPAD / MASTERMIND / HACK SYSTEM
===================================================== */

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

    renderAlarms();

}

function renderAlarms(){

    const container =
        document.getElementById(
            "alarmsDisplay"
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
            "alarmDot";

        container.appendChild(
            dot
        );

    }

}

/* ==========================================
   KEYPAD
========================================== */

function addDigit(
    digit
){

    const input =
        document.getElementById(
            "codeInput"
        );

    if(
        input.value.length >= 4
    ){
        return;
    }

    input.value += digit;

}

function clearCode(){

    document
        .getElementById(
            "codeInput"
        )
        .value = "";

}

function deleteDigit(){

    const input =
        document.getElementById(
            "codeInput"
        );

    input.value =
        input.value.slice(
            0,
            -1
        );

}

/* ==========================================
   HACK BUTTON
========================================== */

function hack(){

    if(processing){
        return;
    }

    const input =
        document.getElementById(
            "codeInput"
        );

    const guess =
        input.value;

    if(
        guess.length !== 4
    ){

        setResult(
            "ENTER 4 DIGITS"
        );

        return;

    }

    processing = true;

    document
        .getElementById(
            "hackButton"
        )
        .disabled = true;

    runProgressBar(
        ()=>{
            processHack(
                guess
            );
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
   MAIN HACK PROCESS
========================================== */

function processHack(
    guess
){

    document
        .getElementById(
            "codeInput"
        )
        .value = "";

    const hints =
        buildHints(
            guess,
            secretCode
        );

    renderHints(
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
   MASTERMIND
========================================== */

function buildHints(
    guess,
    code
){

    const hints = [];

    const codeArr =
        code.split("");

    const guessArr =
        guess.split("");

    const usedCode =
        Array(4).fill(
            false
        );

    const usedGuess =
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

            usedCode[i] =
                true;

            usedGuess[i] =
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

                usedCode[j] =
                    true;

                usedGuess[i] =
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

function renderHints(
    hints
){

    const row =
        document.getElementById(
            "hintRow"
        );

    row.innerHTML = "";

    hints.forEach(
        colour=>{

            const dot =
                document.createElement(
                    "div"
                );

            dot.className =
                "hintDot " +
                colour.toLowerCase();

            row.appendChild(
                dot
            );

        }
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
   EVENT SYSTEM
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
   EVENTS / LETTER REVEALS / STAGES / VICTORY
===================================================== */

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

        processing = false;

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

    const bonusImage =
        document.getElementById(
            "bonusImage"
        );

    if(
        bonusImage &&
        gameData.bonus
    ){

        bonusImage.src =
            gameData.bonus;

    }

    const gallery =
        document.getElementById(
            "finalGallery"
        );

    if(!gallery){
        return;
    }

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
   AUTO SAVE
========================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        saveProgress();

    }

);

/* =====================================================
   END OF FILE
===================================================== */
