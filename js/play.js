/* =====================================================
   VAULT CRACKER
   PART 1
===================================================== */

var gameData = null;

var STORAGE_KEY =
    "vault-cracker-save-v2";

/* ==========================================
   CREATOR DIFFICULTIES
========================================== */

var difficulties = {

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

var outcomePools = [

    [
        "HACKED","HACKED","HACKED","HACKED",
        "HACKED","HACKED","HACKED","HACKED",
        "HACKED","HACKED","HACKED","HACKED",

        "TRY_AGAIN","TRY_AGAIN","TRY_AGAIN",
        "TRY_AGAIN","TRY_AGAIN",

        "FIREWALL","FIREWALL",

        "ALARM",

        "DECRYPTING","DECRYPTING"
    ],

    [
        "HACKED","HACKED","HACKED","HACKED",
        "HACKED","HACKED","HACKED","HACKED",
        "HACKED","HACKED",

        "TRY_AGAIN","TRY_AGAIN","TRY_AGAIN",
        "TRY_AGAIN","TRY_AGAIN",

        "FIREWALL","FIREWALL",

        "ALARM","ALARM","ALARM",

        "DECRYPTING","DECRYPTING"
    ],

    [
        "HACKED","HACKED","HACKED","HACKED",
        "HACKED","HACKED","HACKED","HACKED",

        "TRY_AGAIN","TRY_AGAIN","TRY_AGAIN",
        "TRY_AGAIN","TRY_AGAIN",

        "FIREWALL",

        "ALARM","ALARM","ALARM",
        "ALARM","ALARM",

        "DECRYPTING","DECRYPTING"
    ],

    [
        "HACKED","HACKED","HACKED","HACKED",
        "HACKED","HACKED","HACKED",

        "TRY_AGAIN","TRY_AGAIN",
        "TRY_AGAIN","TRY_AGAIN",

        "FIREWALL",

        "ALARM","ALARM","ALARM",
        "ALARM","ALARM","ALARM",
        "ALARM",

        "DECRYPTING","DECRYPTING"
    ],

    [
        "HACKED","HACKED","HACKED",
        "HACKED","HACKED","HACKED",

        "TRY_AGAIN","TRY_AGAIN",
        "TRY_AGAIN",

        "FIREWALL",

        "ALARM","ALARM","ALARM",
        "ALARM","ALARM","ALARM",
        "ALARM","ALARM","ALARM",

        "DECRYPTING","DECRYPTING"
    ]

];

/* ==========================================
   GAME STATE
========================================== */

var currentStage = 0;

var password = "";
var revealedPassword = "";

var maxAlarms = 0;
var alarms = 0;

var maxAttempts = 0;
var attempts = 0;

var unlockedImages = [];

/* ==========================================
   INIT
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init(){

    var hash =
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

        var json =
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

        console.log(err);

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

            hash:location.hash,

            currentStage:currentStage,

            password:password,

            revealedPassword:revealedPassword,

            maxAlarms:maxAlarms,

            alarms:alarms,

            maxAttempts:maxAttempts,

            attempts:attempts,

            unlockedImages:unlockedImages

        })

    );

}

function loadProgress(){

    var save =
        localStorage.getItem(
            STORAGE_KEY
        );

    if(save){

        try{

            var data =
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

    var stage =
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

    var settings =
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

    var result = "";
    var i;

    for(
        i = 0;
        i < text.length;
        i++
    ){

        if(
            text.charAt(i) === " "
        ){

            result += " ";

        }
        else{

            result += "*";

        }

    }

    return result;

}

/* ==========================================
   UI
========================================== */

function updateUI(){

    var stage =
        gameData.stages[
            currentStage
        ];

    document
        .getElementById(
            "stageTitle"
        )
        .textContent =

        "Stage " +
        (currentStage + 1) +
        " / " +
        gameData.stages.length;

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

        stageReset();
        return;

    }

    attempts--;

    var pool =
        outcomePools[
            Math.min(
                currentStage,
                4
            )
        ];

    var outcome =
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

function resolveOutcome(outcome){

    var message = "";

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

            alarms =
                Math.min(
                    alarms + 1,
                    maxAlarms
                );

            message =
                "🛡 FIREWALL";

            break;

        case "DECRYPTING":

            attempts += 2;

            message =
                "🔓 DECRYPTING";

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

    var hidden = [];
    var i;

    for(
        i = 0;
        i < password.length;
        i++
    ){

        if(
            revealedPassword.charAt(i)
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

    var randomIndex =

        hidden[
            Math.floor(
                Math.random()
                *
                hidden.length
            )
        ];

    var chars =
        revealedPassword.split(
            ""
        );

    chars[randomIndex] =
        password.charAt(
            randomIndex
        );

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
   STAGE RESET
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

    var galleryCard =

        document.getElementById(
            "galleryCard"
        );

    var gallery =

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

    var i;

    for(
        i = 0;
        i < unlockedImages.length;
        i++
    ){

        var img =
            document.createElement(
                "img"
            );

        img.src =
            unlockedImages[i];

        gallery.appendChild(
            img
        );

    }

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
            )
            .src =
            gameData.bonus;

    }

    var gallery =

        document.getElementById(
            "finalGallery"
        );

    gallery.innerHTML = "";

    var images = [];

    images.push(
        gameData.cover
    );

    var i;

    for(
        i = 0;
        i < unlockedImages.length;
        i++
    ){

        images.push(
            unlockedImages[i]
        );

    }

    if(
        gameData.bonus
    ){

        images.push(
            gameData.bonus
        );

    }

    for(
        i = 0;
        i < images.length;
        i++
    ){

        var img =
            document.createElement(
                "img"
            );

        img.src =
            images[i];

        gallery.appendChild(
            img
        );

    }

}

/* ==========================================
   AUTO SAVE
========================================== */

window.addEventListener(

    "beforeunload",

    function(){

        saveProgress();

    }

);

/* ==========================================
   END OF FILE
========================================== */
