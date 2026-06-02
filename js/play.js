let gameData = null;

const STORAGE_KEY =
    "vault-cracker-save-v1";

const difficulties = {

    easy:{
        pins:5,
        lives:5,
        spinTimer:10
    },

    medium:{
        pins:10,
        lives:3,
        spinTimer:8
    },

    hard:{
        pins:18,
        lives:2,
        spinTimer:6
    }

};

const wheels = [

    [
        ...Array(10).fill("CRACK"),
        ...Array(5).fill("SPIN_AGAIN"),
        ...Array(3).fill("SHIELD"),
        ...Array(4).fill("PLUS_2"),
        ...Array(1).fill("PLUS_5"),
        ...Array(1).fill("LOSE_LIFE")
    ],

    [
        ...Array(9).fill("CRACK"),
        ...Array(4).fill("SPIN_AGAIN"),
        ...Array(3).fill("SHIELD"),
        ...Array(4).fill("PLUS_2"),
        ...Array(1).fill("PLUS_5"),
        ...Array(3).fill("LOSE_LIFE")
    ],

    [
        ...Array(8).fill("CRACK"),
        ...Array(4).fill("SPIN_AGAIN"),
        ...Array(2).fill("SHIELD"),
        ...Array(4).fill("PLUS_2"),
        ...Array(1).fill("PLUS_5"),
        ...Array(5).fill("LOSE_LIFE")
    ],

    [
        ...Array(7).fill("CRACK"),
        ...Array(3).fill("SPIN_AGAIN"),
        ...Array(2).fill("SHIELD"),
        ...Array(4).fill("PLUS_2"),
        ...Array(1).fill("PLUS_5"),
        ...Array(7).fill("LOSE_LIFE")
    ],

    [
        ...Array(6).fill("CRACK"),
        ...Array(3).fill("SPIN_AGAIN"),
        ...Array(1).fill("SHIELD"),
        ...Array(4).fill("PLUS_2"),
        ...Array(1).fill("PLUS_5"),
        ...Array(9).fill("LOSE_LIFE")
    ]

];

let currentStage = 0;

let pinsRemaining = 0;
let maxPins = 0;

let lives = 0;
let maxLives = 0;

let timer = 0;
let maxTimer = 0;

let shield = false;

let unlockedImages = [];

let currentRotation = 0;
let spinning = false;

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
            JSON.parse(json);

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

                pinsRemaining =
                    data.pinsRemaining;

                maxPins =
                    data.maxPins;

                lives =
                    data.lives;

                maxLives =
                    data.maxLives;

                timer =
                    data.timer;

                maxTimer =
                    data.maxTimer;

                shield =
                    data.shield;

                unlockedImages =
                    data.unlockedImages || [];

            }

        }
        catch(e){}

    }

    document
        .getElementById(
            "loadingScreen"
        )
        .classList.add(
            "hidden"
        );

    if(
        currentStage === 0 &&
        unlockedImages.length === 0 &&
        maxPins === 0
    ){

        showCover();

    }
    else{

        startGameUI();

    }

}

function saveProgress(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            hash:
                location.hash,

            currentStage,

            pinsRemaining,

            maxPins,

            lives,

            maxLives,

            timer,

            maxTimer,

            shield,

            unlockedImages

        })

    );

}

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

    document
        .getElementById(
            "coverScreen"
        )
        .classList.add(
            "hidden"
        );

    currentStage = 0;
    unlockedImages = [];

    loadStage();

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

    drawWheel();

    updateUI();

    renderGallery();

}

function loadStage(){

    const stage =
        gameData.stages[
            currentStage
        ];

    const settings =
        difficulties[
            stage.difficulty
        ];

    maxPins =
        settings.pins;

    pinsRemaining =
        settings.pins;

    maxLives =
        settings.lives;

    lives =
        settings.lives;

    maxTimer =
        settings.spinTimer;

    timer =
        settings.spinTimer;

    shield = false;

    drawWheel();

    saveProgress();

}

function updateUI(){

    document.getElementById(
        "stageTitle"
    ).textContent =

        `Stage ${
            currentStage + 1
        } / ${
            gameData.stages.length
        }`;

    document.getElementById(
        "pinsRemaining"
    ).textContent =
        pinsRemaining;

    document.getElementById(
        "pinProgress"
    ).style.width =

        (
            (
                maxPins -
                pinsRemaining
            )
            /
            maxPins
        ) * 100 + "%";

    document.getElementById(
        "livesDisplay"
    ).textContent =

        "❤".repeat(
            lives
        );

    document.getElementById(
        "shieldDisplay"
    ).textContent =

        shield
        ? "ACTIVE"
        : "None";

    document.getElementById(
        "timerDisplay"
    ).textContent =

        `${timer} / ${maxTimer}`;

}

function drawWheel(){

    const canvas =
        document.getElementById(
            "wheel"
        );

    const ctx =
        canvas.getContext(
            "2d"
        );

    const wheelData =
        wheels[
            Math.min(
                currentStage,
                4
            )
        ];

    const center = 170;

    const radius = 160;

    ctx.clearRect(
        0,
        0,
        340,
        340
    );

    const angle =
        (Math.PI * 2)
        /
        wheelData.length;

    for(
        let i=0;
        i<wheelData.length;
        i++
    ){

        ctx.beginPath();

        ctx.moveTo(
            center,
            center
        );

        ctx.arc(
            center,
            center,
            radius,
            i * angle,
            (i + 1) * angle
        );

        let color =
            "#00b894";

        if(
            wheelData[i] ===
            "LOSE_LIFE"
        ){
            color = "#c0392b";
        }

        else if(
            wheelData[i] ===
            "SHIELD"
        ){
            color = "#2980b9";
        }

        else if(
            wheelData[i] ===
            "PLUS_5"
        ){
            color = "#f1c40f";
        }

        else if(
            wheelData[i] ===
            "PLUS_2"
        ){
            color = "#9b59b6";
        }

        else if(
            wheelData[i] ===
            "SPIN_AGAIN"
        ){
            color = "#e67e22";
        }

        ctx.fillStyle =
            color;

        ctx.fill();

    }

}

function spinWheel(){

    if(spinning){
        return;
    }

    spinning = true;

    const wheel =
        document.getElementById(
            "wheel"
        );

    const wheelData =
        wheels[
            Math.min(
                currentStage,
                4
            )
        ];

    const resultIndex =
        Math.floor(
            Math.random()
            *
            wheelData.length
        );

    const result =
        wheelData[
            resultIndex
        ];

    const segmentSize =
        360 /
        wheelData.length;

    currentRotation +=

        1440 +

        (
            360 -
            (
                resultIndex
                *
                segmentSize
            )
        );

    wheel.style.transform =
        `rotate(${currentRotation}deg)`;

    setTimeout(()=>{

        applyResult(
            result
        );

        spinning = false;

    },4000);

}

function applyResult(result){

    timer--;

    let message = "";

    switch(result){

        case "CRACK":

            pinsRemaining--;

            message =
                "Pin Cracked";

            break;

        case "SHIELD":

            shield = true;

            message =
                "Shield Activated";

            break;

        case "PLUS_2":

            timer += 2;

            message =
                "+2 Spins";

            break;

        case "PLUS_5":

            timer += 5;

            message =
                "+5 Spins";

            break;

        case "SPIN_AGAIN":

            message =
                "Spin Again";

            break;

        case "LOSE_LIFE":

            if(shield){

                shield = false;

                message =
                    "Shield Blocked Damage";

            }
            else{

                lives--;

                message =
                    "Lost A Life";

            }

            break;

    }

    if(
        timer <= 0
    ){

        lives--;

        timer =
            maxTimer;

        message +=
            " | Timer Penalty";

    }

    document.getElementById(
        "resultBox"
    ).textContent =
        message;

    updateUI();

    saveProgress();

    if(
        pinsRemaining <= 0
    ){

        stageComplete();

        return;

    }

    if(
        lives <= 0
    ){

        stageReset();

        return;

    }

}

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

    updateUI();

}

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

    updateUI();

}

function renderGallery(){

    const card =
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

        card.classList.add(
            "hidden"
        );

        return;

    }

    card.classList.remove(
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

function showVictory(){

    localStorage.removeItem(
        STORAGE_KEY
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

saveProgress();
