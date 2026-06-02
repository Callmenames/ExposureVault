/* =====================================================
   VAULT CRACKER
   PART 1
   CORE STATE / SAVE SYSTEM / STAGES
===================================================== */

let gameData = null;

const STORAGE_KEY =
    "vault-cracker-save-v3";

/* =====================================================
   CREATOR DIFFICULTIES
===================================================== */

const difficulties = {

    easy:{
        alarms:5,
        attempts:10
    },

    medium:{
        alarms:3,
        attempts:8
    },

    hard:{
        alarms:2,
        attempts:6
    }

};

/* =====================================================
   STAGE CURVE
===================================================== */

const outcomePools = [

    [
        ...Array(12).fill("HACKED"),
        ...Array(5).fill("TRY_AGAIN"),
        ...Array(2).fill("FIREWALL"),
        ...Array(1).fill("ALARM"),
        ...Array(2).fill("DECRYPTING")
    ],

    [
        ...Array(10).fill("HACKED"),
        ...Array(5).fill("TRY_AGAIN"),
        ...Array(2).fill("FIREWALL"),
        ...Array(3).fill("ALARM"),
        ...Array(2).fill("DECRYPTING")
    ],

    [
        ...Array(8).fill("HACKED"),
        ...Array(5).fill("TRY_AGAIN"),
        ...Array(1).fill("FIREWALL"),
        ...Array(5).fill("ALARM"),
        ...Array(2).fill("DECRYPTING")
    ],

    [
        ...Array(7).fill("HACKED"),
        ...Array(4).fill("TRY_AGAIN"),
        ...Array(1).fill("FIREWALL"),
        ...Array(7).fill("ALARM"),
        ...Array(2).fill("DECRYPTING")
    ],

    [
        ...Array(6).fill("HACKED"),
        ...Array(3).fill("TRY_AGAIN"),
        ...Array(1).fill("FIREWALL"),
        ...Array(9).fill("ALARM"),
        ...Array(2).fill("DECRYPTING")
    ]

];

/* =====================================================
   GAME STATE
===================================================== */

let currentStage = 0;

let password = "";
let revealedPassword = "";

let maxAlarms = 0;
let alarms = 0;

let maxAttempts = 0;
let attempts = 0;

let unlockedImages = [];

let currentCode = "";

let bonusDigit = 0;
let trapDigit = 0;

let processingHack = false;

/* =====================================================
   INIT
===================================================== */

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

/* =====================================================
   SAVE
===================================================== */

function saveProgress(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            hash:
                location.hash,

            currentStage,

            password,

            revealedPassword,

            maxAlarms,

            alarms,

            maxAttempts,

            attempts,

            unlockedImages,

            bonusDigit,

            trapDigit

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
                JSON.parse(save);

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

                maxAlarms =
                    data.maxAlarms || 0;

                alarms =
                    data.alarms || 0;

                maxAttempts =
                    data.maxAttempts || 0;

                attempts =
                    data.attempts || 0;

                unlockedImages =
                    data.unlockedImages || [];

                bonusDigit =
                    data.bonusDigit ?? 0;

                trapDigit =
                    data.trapDigit ?? 0;

            }

        }
        catch(err){

            console.error(err);

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

/* =====================================================
   COVER
===================================================== */

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

/* =====================================================
   STAGES
===================================================== */

function loadStage(){

    const stage =

        gameData.stages[
            currentStage
        ];

    password =
        String(
            stage.password || ""
        ).toUpperCase();

    revealedPassword =
        buildHiddenPassword(
            password
        );

    const settings =

        difficulties[
            stage.difficulty
        ];

    maxAlarms =
        settings.alarms;

    alarms =
        settings.alarms;

    maxAttempts =
        settings.attempts;

    attempts =
        settings.attempts;

    currentCode = "";

    generateDigits();

    saveProgress();

}

function buildHiddenPassword(text){

    return text
        .split("")
        .map(char => {

            if(char === " "){

                return " ";

            }

            return "*";

        })
        .join("");

}

function generateDigits(){

    bonusDigit =
        Math.floor(
            Math.random() * 10
        );

    do{

        trapDigit =
            Math.floor(
                Math.random() * 10
            );

    }
    while(
        trapDigit ===
        bonusDigit
    );

}

/* =====================================================
   UI
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

        stage.difficulty
            .toUpperCase();

    document
        .getElementById(
            "vaultImage"
        )
        .src =
        stage.image;

    document
        .getElementById(
            "passwordDisplay"
        )
        .textContent =
        revealedPassword;

    document
        .getElementById(
            "attemptsDisplay"
        )
        .textContent =
        attempts;

    document
        .getElementById(
            "codeDisplay"
        )
        .value =
        currentCode;

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
                "span"
            );

        dot.className =
            "alarm";

        container.appendChild(
            dot
        );

    }

}

/* =====================================================
   VAULT CRACKER
   PART 2
   NUMPAD / HACKING / OUTCOMES
===================================================== */

/* =====================================================
   NUMPAD
===================================================== */

function addDigit(digit){

    if(processingHack){
        return;
    }

    if(
        currentCode.length >= 4
    ){
        return;
    }

    currentCode += digit;

    document
        .getElementById(
            "codeDisplay"
        )
        .value =
        currentCode;

}

function backspaceDigit(){

    if(processingHack){
        return;
    }

    currentCode =
        currentCode.slice(
            0,
            -1
        );

    document
        .getElementById(
            "codeDisplay"
        )
        .value =
        currentCode;

}

function clearCode(){

    if(processingHack){
        return;
    }

    currentCode = "";

    document
        .getElementById(
            "codeDisplay"
        )
        .value = "";

}

/* =====================================================
   HACK BUTTON
===================================================== */

function hack(){

    if(processingHack){
        return;
    }

    if(
        currentCode.length !== 4
    ){

        document
            .getElementById(
                "resultBox"
            )
            .textContent =
            "ENTER 4 DIGITS";

        return;

    }

    processingHack = true;

    disableInputs();

    attempts--;

    const digits =
        currentCode.split("");

    let bonusHits = 0;
    let trapHits = 0;

    digits.forEach(digit=>{

        if(
            Number(digit) ===
            bonusDigit
        ){
            bonusHits++;
        }

        if(
            Number(digit) ===
            trapDigit
        ){
            trapHits++;
        }

    });

    /* =====================
       TRAP DAMAGE FIRST
    ===================== */

    alarms -= trapHits;

    /* =====================
       ATTEMPTS RESET RULE
    ===================== */

    if(
        attempts <= 0
    ){

        alarms--;

        attempts =
            maxAttempts;

    }

    const progress =

        document.getElementById(
            "hackProgress"
        );

    progress.style.transition =
        "none";

    progress.style.width =
        "0%";

    void progress.offsetWidth;

    progress.style.transition =
        "width 1s linear";

    progress.style.width =
        "100%";

    setTimeout(

        ()=>{

            processHackRolls(
                bonusHits,
                trapHits
            );

        },

        1000

    );

}

/* =====================================================
   PROCESS ROLLS
===================================================== */

function processHackRolls(

    bonusHits,
    trapHits

){

    const results = [];

    if(
        trapHits > 0
    ){

        results.push(
            `TRAP x${trapHits}`
        );

    }

    if(
        bonusHits > 0
    ){

        results.push(
            `BONUS x${bonusHits}`
        );

    }

    const totalRolls =
        1 + bonusHits;

    for(
        let i = 0;
        i < totalRolls;
        i++
    ){

        const outcome =
            getRandomOutcome();

        results.push(
            outcome
        );

        applyOutcome(
            outcome
        );

    }

    document
        .getElementById(
            "resultBox"
        )
        .textContent =
        results.join("\n");

    updateUI();

    saveProgress();

    generateDigits();

    currentCode = "";

    document
        .getElementById(
            "codeDisplay"
        )
        .value = "";

    setTimeout(

        ()=>{

            document
                .getElementById(
                    "hackProgress"
                )
                .style.width =
                "0%";

            document
                .getElementById(
                    "resultBox"
                )
                .textContent =
                "";

            processingHack =
                false;

            enableInputs();

            checkState();

        },

        1200

    );

}

/* =====================================================
   RANDOM OUTCOME
===================================================== */

function getRandomOutcome(){

    const pool =

        outcomePools[
            Math.min(
                currentStage,
                4
            )
        ];

    return pool[
        Math.floor(
            Math.random()
            *
            pool.length
        )
    ];

}

/* =====================================================
   APPLY OUTCOME
===================================================== */

function applyOutcome(outcome){

    switch(outcome){

        case "HACKED":

            revealLetter();

            break;

        case "TRY_AGAIN":

            break;

        case "ALARM":

            alarms--;

            break;

        case "FIREWALL":

            alarms++;

            break;

        case "DECRYPTING":

            attempts += 2;

            break;

    }

}

/* =====================================================
   PASSWORD REVEAL
===================================================== */

function revealLetter(){

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

            hidden.push(i);

        }

    }

    if(
        hidden.length === 0
    ){
        return;
    }

    const revealIndex =

        hidden[
            Math.floor(
                Math.random()
                *
                hidden.length
            )
        ];

    const chars =
        revealedPassword
        .split("");

    chars[
        revealIndex
    ] =
    password[
        revealIndex
    ];

    revealedPassword =
        chars.join("");

}

/* =====================================================
   INPUT LOCKING
===================================================== */

function disableInputs(){

    document
        .querySelectorAll(
            ".numBtn"
        )
        .forEach(btn=>{

            btn.disabled = true;

        });

    document
        .getElementById(
            "hackButton"
        )
        .disabled = true;

}

function enableInputs(){

    document
        .querySelectorAll(
            ".numBtn"
        )
        .forEach(btn=>{

            btn.disabled = false;

        });

    document
        .getElementById(
            "hackButton"
        )
        .disabled = false;

}

/* =====================================================
   STATE CHECKS
===================================================== */

function checkState(){

    if(
        revealedPassword ===
        password
    ){

        stageComplete();
        return;

    }

    if(
        alarms <= 0
    ){

        stageReset();
        return;

    }

}

/* =====================================================
   VAULT CRACKER
   PART 3
   STAGE COMPLETE / RESET / GALLERY / VICTORY
===================================================== */

/* =====================================================
   STAGE COMPLETE
===================================================== */

function stageComplete(){

    saveProgress();

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
        )
        .src =

        gameData.stages[
            currentStage
        ].image;

}

function continueAfterReveal(){

    const image =

        gameData.stages[
            currentStage
        ].image;

    unlockedImages.push(
        image
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

/* =====================================================
   STAGE RESET
===================================================== */

function stageReset(){

    saveProgress();

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

/* =====================================================
   GALLERY
===================================================== */

function renderGallery(){

    const galleryCard =

        document.getElementById(
            "galleryCard"
        );

    const gallery =

        document.getElementById(
            "gallery"
        );

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

        src => {

            const img =
                document.createElement(
                    "img"
                );

            img.src = src;

            gallery.appendChild(
                img
            );

        }

    );

}

/* =====================================================
   VICTORY
===================================================== */

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

    /* Bonus image */

    if(
        gameData.bonus
    ){

        document
            .getElementById(
                "bonusImage"
            )
            .src =
            gameData.bonus;

    }

    /* Final gallery */

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

        src => {

            const img =
                document.createElement(
                    "img"
                );

            img.src = src;

            gallery.appendChild(
                img
            );

        }

    );

}

/* =====================================================
   AUTO SAVE
===================================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        saveProgress();

    }

);

/* =====================================================
   END OF FILE
===================================================== */
