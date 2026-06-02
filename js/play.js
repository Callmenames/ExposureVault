/* =====================================================
   VAULT CRACKER
   PART 1
   Core State / Save System / Stage Loading
===================================================== */

let gameData = null;

const STORAGE_KEY =
    "vault-cracker-save-v1";

const difficulties = {

    easy:{
        pins:5,
        lives:5,
        spins:10
    },

    medium:{
        pins:10,
        lives:3,
        spins:8
    },

    hard:{
        pins:18,
        lives:2,
        spins:6
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

const wheelColors = {

    CRACK:"#f1c40f",

    LOSE_LIFE:"#e74c3c",

    SHIELD:"#3498db",

    PLUS_2:"#27ae60",

    PLUS_5:"#2ecc71",

    SPIN_AGAIN:"#7f8c8d"

};

const wheelLabels = {

    CRACK:"PIN",

    LOSE_LIFE:"LIFE",

    SHIELD:"SHIELD",

    PLUS_2:"+2",

    PLUS_5:"+5",

    SPIN_AGAIN:"SPIN"

};

let currentStage = 0;

let maxPins = 0;
let pinsRemaining = 0;

let maxLives = 0;
let lives = 0;

let maxSpins = 0;
let spinsRemaining = 0;

let shield = false;

let unlockedImages = [];

let currentWheelLayout = [];

let spinning = false;

let currentRotation = 0;

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

        console.error(
            err
        );

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
                JSON.parse(
                    save
                );

            if(
                data.hash ===
                location.hash
            ){

                currentStage =
                    data.currentStage;

                maxPins =
                    data.maxPins;

                pinsRemaining =
                    data.pinsRemaining;

                maxLives =
                    data.maxLives;

                lives =
                    data.lives;

                maxSpins =
                    data.maxSpins;

                spinsRemaining =
                    data.spinsRemaining;

                shield =
                    data.shield;

                unlockedImages =
                    data.unlockedImages || [];

            }

        }
        catch(err){

            console.log(
                err
            );

        }

    }

    document.getElementById(
        "loadingScreen"
    ).classList.add(
        "hidden"
    );

    if(
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

            maxPins,

            pinsRemaining,

            maxLives,

            lives,

            maxSpins,

            spinsRemaining,

            shield,

            unlockedImages

        })

    );

}

function showCover(){

    document.getElementById(
        "coverScreen"
    ).classList.remove(
        "hidden"
    );

    document.getElementById(
        "coverImage"
    ).src =
        gameData.cover;

}

function startGame(){

    currentStage = 0;

    unlockedImages = [];

    loadStage();

    document.getElementById(
        "coverScreen"
    ).classList.add(
        "hidden"
    );

    startGameUI();

}

function startGameUI(){

    document.getElementById(
        "gameScreen"
    ).classList.remove(
        "hidden"
    );

    updateUI();

    renderGallery();

    drawWheel();

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

    maxSpins =
        settings.spins;

    spinsRemaining =
        settings.spins;

    shield = false;

    currentWheelLayout =
        shuffleArray(

            wheels[
                Math.min(
                    currentStage,
                    4
                )
            ]

        );

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
        "difficultyDisplay"
    ).textContent =

        gameData
        .stages[
            currentStage
        ]
        .difficulty
        .toUpperCase();

    document.getElementById(
        "pinDisplay"
    ).textContent =

        "🔑".repeat(
            pinsRemaining
        );

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
        "spinsDisplay"
    ).textContent =

        spinsRemaining;

}

function shuffleArray(array){

    const arr = [...array];

    for(

        let i =
            arr.length - 1;

        i > 0;

        i--

    ){

        const j =

            Math.floor(
                Math.random()
                *
                (i + 1)
            );

        [
            arr[i],
            arr[j]
        ] = [

            arr[j],
            arr[i]

        ];

    }

    return arr;

}

/* =====================================================
   PART 2
   Wheel Rendering / Animation / Spin Logic
===================================================== */

function drawWheel(){

    const canvas =
        document.getElementById(
            "wheel"
        );

    const ctx =
        canvas.getContext(
            "2d"
        );

    const width =
        canvas.width;

    const height =
        canvas.height;

    const centerX =
        width / 2;

    const centerY =
        height / 2;

    const radius = 160;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const segmentCount =
        currentWheelLayout.length;

    const segmentAngle =
        (Math.PI * 2)
        /
        segmentCount;

    for(
        let i = 0;
        i < segmentCount;
        i++
    ){

        const segment =
            currentWheelLayout[i];

        const start =
            i *
            segmentAngle;

        const end =
            start +
            segmentAngle;

        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );

        ctx.arc(
            centerX,
            centerY,
            radius,
            start,
            end
        );

        ctx.closePath();

        ctx.fillStyle =
            wheelColors[
                segment
            ];

        ctx.fill();

        ctx.strokeStyle =
            "#111";

        ctx.lineWidth = 2;

        ctx.stroke();

        drawSegmentLabel(

            ctx,

            segment,

            start,

            end,

            centerX,

            centerY,

            radius

        );

    }

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        25,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#222";

    ctx.fill();

    ctx.strokeStyle =
        "#555";

    ctx.lineWidth = 4;

    ctx.stroke();

}

function drawSegmentLabel(

    ctx,
    segment,
    start,
    end,
    centerX,
    centerY,
    radius

){

    const angle =

        (
            start +
            end
        ) / 2;

    const x =

        centerX +

        Math.cos(
            angle
        ) *

        (radius * 0.68);

    const y =

        centerY +

        Math.sin(
            angle
        ) *

        (radius * 0.68);

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.rotate(
        angle +
        Math.PI / 2
    );

    ctx.fillStyle =
        "#000";

    ctx.font =
        "bold 11px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(

        wheelLabels[
            segment
        ],

        0,

        0

    );

    ctx.restore();

}

function spinWheel(){

    if(spinning){
        return;
    }

    spinning = true;

    document
        .getElementById(
            "spinButton"
        )
        .disabled = true;

    const wheel =
        document.getElementById(
            "wheel"
        );

    const resultIndex =

        Math.floor(

            Math.random()

            *
            currentWheelLayout.length

        );

    const result =

        currentWheelLayout[
            resultIndex
        ];

    const segmentSize =

        360
        /
        currentWheelLayout.length;

    const targetRotation =

        360
        -
        (
            resultIndex
            *
            segmentSize
        );

    currentRotation +=

        1440 +

        targetRotation;

    wheel.style.transform =

        `rotate(${currentRotation}deg)`;

    setTimeout(

        ()=>{

            resolveSpin(
                result
            );

            spinning = false;

            document
                .getElementById(
                    "spinButton"
                )
                .disabled = false;

        },

        4000

    );

}

function resolveSpin(result){

    spinsRemaining--;

    let message = "";

    switch(result){

        case "CRACK":

            pinsRemaining--;

            message =
                "🔓 Pin Cracked";

            break;

        case "SHIELD":

            shield = true;

            message =
                "🛡 Shield Activated";

            break;

        case "PLUS_2":

            spinsRemaining += 2;

            message =
                "➕ 2 Spins";

            break;

        case "PLUS_5":

            spinsRemaining += 5;

            message =
                "➕ 5 Spins";

            break;

        case "SPIN_AGAIN":

            message =
                "🎯 Spin Again";

            break;

        case "LOSE_LIFE":

            if(shield){

                shield = false;

                message =
                    "🛡 Shield Blocked Damage";

            }
            else{

                lives--;

                message =
                    "❤ Lost Life";

            }

            break;

    }

    if(
        spinsRemaining <= 0
    ){

        lives--;

        spinsRemaining =
            maxSpins;

        message +=

            " | ⏳ Spin Limit Reached";

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

/* =====================================================
   PART 3
   Stage Complete / Reset / Gallery / Victory
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

    const stageImage =

        gameData.stages[
            currentStage
        ].image;

    unlockedImages.push(
        stageImage
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

    drawWheel();

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

    drawWheel();

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

        imageSrc=>{

            const img =

                document.createElement(
                    "img"
                );

            img.src =
                imageSrc;

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

    const gallery =

        document.getElementById(
            "finalGallery"
        );

    gallery.innerHTML = "";

    const allImages = [

        gameData.cover,

        ...unlockedImages

    ];

    if(
        gameData.bonus
    ){

        allImages.push(
            gameData.bonus
        );

    }

    allImages.forEach(

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

window.addEventListener(

    "beforeunload",

    ()=>{

        saveProgress();

    }

);

/* =====================================================
   END OF FILE
===================================================== */
