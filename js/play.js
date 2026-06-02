```javascript
/* =====================================================
   VAULT CRACKER
===================================================== */

let gameData = null;

const STORAGE_KEY =
    "vault-cracker-save-v2";

/* ==========================================
   CREATOR DIFFICULTIES
========================================== */

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

/* ==========================================
   STAGE DIFFICULTY CURVE
========================================== */

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

/* ==========================================
   GAME STATE
========================================== */

let currentStage = 0;

let password = "";
let revealedPassword = "";

let maxAlarms = 0;
let alarms = 0;

let maxAttempts = 0;
let attempts = 0;

let unlockedImages = [];

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

            maxAlarms,

            alarms,

            maxAttempts,

            attempts,

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
                JSON.parse(save);

            if(
                data.hash ===
                location.hash
            ){

                currentStage =
                    data.currentStage;

                password =
                    data.password;

                revealedPassword =
                    data.revealedPassword;

                maxAlarms =
                    data.maxAlarms;

                alarms =
                    data.alarms;

                maxAttempts =
                    data.maxAttempts;

                attempts =
                    data.attempts;

                unlockedImages =
                    data.unlockedImages || [];

            }

        }
        catch(err){}

    }

    document
        .getElementById(
            "loadingScreen"
        )
        .classList.add(
            "hidden"
        );

    if(
        password === ""
    ){

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
        )
        .src =
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
   STAGES
========================================== */

function loadStage(){

    const stage =
        gameData.stages[
            currentStage
        ];

    password =
        stage.password
        .toUpperCase();

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

    saveProgress();

}

function buildHiddenPassword(text){

    return text
        .split("")
        .map(char=>{

            if(char === " ")
                return " ";

            return "*";

        })
        .join("");

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
        stage.difficulty;

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
            "alarmsDisplay"
        )
        .textContent =
        "🚨".repeat(
            alarms
        );

}

/* ==========================================
   HACK BUTTON
========================================== */

function hack(){

    if(
        attempts <= 0
    ){
        return;
    }

    attempts--;

    const pool =

        outcomePools[
            Math.min(
                currentStage,
                4
            )
        ];

    const outcome =

        pool[
            Math.floor(
                Math.random()
                *
                pool.length
            )
        ];

    resolveOutcome(
        outcome
    );

}

/* ==========================================
   OUTCOMES
========================================== */

function resolveOutcome(outcome){

    let message = "";

    switch(outcome){

        case "HACKED":

            revealLetter();

            message =
                "💻 HACKED";

            break;

        case "TRY_AGAIN":

            message =
                "🔄 TRY AGAIN";

            break;

        case "ALARM":

            alarms--;

            message =
                "🚨 ALARM";

            break;

        case "FIREWALL":

            alarms++;

            message =
                "🛡 FIREWALL (+1 Alarm)";

            break;

        case "DECRYPTING":

            attempts += 2;

            message =
                "🔓 DECRYPTING (+2 Attempts)";

            break;

    }

    document
        .getElementById(
            "resultBox"
        )
        .textContent =
        message;

    updateUI();

    saveProgress();

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

/* ==========================================
   LETTER REVEAL
========================================== */

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

    const index =

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

    chars[index] =
        password[index];

    revealedPassword =
        chars.join("");

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
        )
        .src =

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
   RESET
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

            img.src = src;

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
            "victoryScreen"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "bonusImage"
        )
        .src =
        gameData.bonus;

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

            img.src = src;

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
```
