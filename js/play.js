let vaultData;

try{

    const json =
        LZString.decompressFromEncodedURIComponent(
            location.hash.substring(1)
        );

    vaultData =
        JSON.parse(json);

}catch(error){

    document.body.innerHTML =
        `
        <div style="
            color:white;
            padding:20px;
            font-family:Arial;
        ">
            ERROR:<br><br>
            ${error}
        </div>
        `;

    throw error;

}

let currentStageIndex = 0;

let currentCode = "";

let secretCode = "";

let alarms = 0;

let maxAlarms = 0;

let revealedLetters = [];

let currentStage = null;

const hackMessages = [
    "BYPASSING FIREWALL...",
    "SCANNING NODE...",
    "INJECTING PAYLOAD...",
    "ACCESSING VAULT..."
];

function calculateAlarms(
    password,
    difficulty
){

    const length =
        password.length;

    if(difficulty === "easy"){

        return length;

    }

    if(difficulty === "medium"){

        return Math.ceil(
            length * 0.75
        );

    }

    return Math.ceil(
        length * 0.5
    );

}

function generateSecretCode(){

    return Math.floor(
        Math.random() * 10000
    )
    .toString()
    .padStart(
        4,
        "0"
    );

}

function loadStage(){

    currentStage =
        vaultData.stages[
            currentStageIndex
        ];

    secretCode =
        generateSecretCode();

    currentCode = "";

    maxAlarms =
        calculateAlarms(
            currentStage.password,
            currentStage.difficulty
        );

    alarms =
        maxAlarms;

    revealedLetters =
        new Array(
            currentStage.password.length
        ).fill(
            false
        );

    updateStageUI();

    updateAlarms();

    updatePassword();

    updateCodeDisplay();

    clearHints();

    logMessage(
        `Stage ${
            currentStageIndex + 1
        } loaded`
    );

}function updateStageUI(){

    document.getElementById(
        "stageLabel"
    ).textContent =

        `Stage ${
            currentStageIndex + 1
        } / ${
            vaultData.stages.length
        }`;

    document.getElementById(
        "difficultyBadge"
    ).textContent =
        currentStage.difficulty
            .toUpperCase();

    document.getElementById(
        "backgroundImage"
    ).style.backgroundImage =

        `url("${currentStage.image}")`;

    document.getElementById(
        "targetImage"
    ).src =
        currentStage.image;

}

function updateAlarms(){

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

        const alarm =
            document.createElement(
                "div"
            );

        alarm.className =
            "alarm";

        container.appendChild(
            alarm
        );

    }

}

function updatePassword(){

    const password =
        currentStage.password;

    let display = "";

    for(
        let i = 0;
        i < password.length;
        i++
    ){

        display +=

            revealedLetters[i]

            ? password[i]

            : "*";

        display += " ";

    }

    document.getElementById(
        "passwordDisplay"
    ).textContent =
        display.trim();

    updateImageBlur();

}

function updateImageBlur(){

    const revealedCount =

        revealedLetters.filter(
            x => x
        ).length;

    const total =
        revealedLetters.length;

    const percent =

        total === 0

        ? 0

        : revealedCount / total;

    const blur =

        Math.max(
            0,
            40 -
            (
                percent * 40
            )
        );

    document.getElementById(
        "targetImage"
    ).style.filter =

        `blur(${blur}px)`;

}

function addDigit(
    digit
){

    if(
        currentCode.length >= 4
    ){
        return;
    }

    currentCode += digit;

    updateCodeDisplay();

}

function clearCode(){

    currentCode =
        currentCode.slice(
            0,
            -1
        );

    updateCodeDisplay();

}

function resetCode(){

    currentCode = "";

    updateCodeDisplay();

}

function updateCodeDisplay(){

    let display =
        currentCode;

    while(
        display.length < 4
    ){

        display += "-";

    }

    document.getElementById(
        "codeDisplay"
    ).textContent =
        display;

}

function logMessage(
    text
){

    const log =
        document.getElementById(
            "log"
        );

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "logEntry";

    div.textContent =
        text;

    log.prepend(
        div
    );

}

function clearHints(){

    document.getElementById(
        "hintLights"
    ).innerHTML = "";

}

function showModal(
    title,
    message
){

    document.getElementById(
        "modalTitle"
    ).textContent =
        title;

    document.getElementById(
        "modalMessage"
    ).textContent =
        message;

    document.getElementById(
        "modal"
    ).style.display =
        "flex";

}

function closeModal(){

    document.getElementById(
        "modal"
    ).style.display =
        "none";

}

window.addEventListener(
    "load",
    loadStage
);

const wheelTables = [

    // Stage 1

    [
        "HACK",
        "HACK",
        "HACK",

        "ALARM",
        "ALARM",

        "SAFE",
        "SAFE",

        "DECRYPT",

        "DIFFUSE",

        "CAUTION"
    ],

    // Stage 2

    [
        "HACK",
        "HACK",

        "ALARM",
        "ALARM",
        "ALARM",

        "SAFE",
        "SAFE",

        "DECRYPT",

        "DIFFUSE",

        "CAUTION"
    ],

    // Stage 3

    [
        "HACK",
        "HACK",

        "ALARM",
        "ALARM",
        "ALARM",

        "SAFE",

        "DECRYPT",

        "DIFFUSE",

        "CAUTION",

        "ALARM"
    ],

    // Stage 4

    [
        "HACK",

        "ALARM",
        "ALARM",
        "ALARM",
        "ALARM",

        "SAFE",

        "DECRYPT",

        "DIFFUSE",

        "CAUTION",

        "ALARM"
    ],

    // Stage 5

    [
        "HACK",

        "ALARM",
        "ALARM",
        "ALARM",
        "ALARM",
        "ALARM",

        "SAFE",

        "DECRYPT",

        "DIFFUSE",

        "CAUTION"
    ]

];

let previousWheelIndex = -1;

async function playHackAnimation(){

    const overlay =
        document.getElementById(
            "hackOverlay"
        );

    const bar =
        document.getElementById(
            "progressInner"
        );

    const status =
        document.getElementById(
            "hackStatus"
        );

    overlay.style.display =
        "flex";

    bar.style.transition =
        "none";

    bar.style.width =
        "0%";

    status.textContent =
        hackMessages[0];

    await new Promise(
        r => setTimeout(r,20)
    );

    bar.style.transition =
        "width .5s linear";

    bar.style.width =
        "100%";

    let index = 0;

    const interval =
        setInterval(()=>{

            index++;

            status.textContent =
                hackMessages[
                    index %
                    hackMessages.length
                ];

        },125);

    await new Promise(
        r => setTimeout(r,500)
    );

    clearInterval(
        interval
    );

    overlay.style.display =
        "none";

}

function buildHints(
    guess,
    answer
){

    const result =
        new Array(4);

    const answerArr =
        answer.split("");

    const guessArr =
        guess.split("");

    for(
        let i = 0;
        i < 4;
        i++
    ){

        if(
            guessArr[i] ===
            answerArr[i]
        ){

            result[i] =
                "green";

            answerArr[i] =
                null;

            guessArr[i] =
                null;

        }

    }

    for(
        let i = 0;
        i < 4;
        i++
    ){

        if(
            guessArr[i] === null
        ){
            continue;
        }

        const matchIndex =

            answerArr.indexOf(
                guessArr[i]
            );

        if(
            matchIndex !== -1
        ){

            result[i] =
                "yellow";

            answerArr[
                matchIndex
            ] = null;

        }else{

            result[i] =
                "grey";

        }

    }

    return result;

}

function showHints(
    hints
){

    const container =
        document.getElementById(
            "hintLights"
        );

    container.innerHTML = "";

    hints.forEach(
        colour=>{

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                `hint ${colour}`;

            container.appendChild(
                div
            );

        }
    );

}

function revealRandomLetters(
    amount
){

    const available = [];

    for(
        let i = 0;
        i < revealedLetters.length;
        i++
    ){

        if(
            !revealedLetters[i]
        ){

            available.push(i);

        }

    }

    amount =
        Math.min(
            amount,
            available.length
        );

    for(
        let i = 0;
        i < amount;
        i++
    ){

        const randomIndex =

            Math.floor(
                Math.random() *
                available.length
            );

        const letterIndex =

            available.splice(
                randomIndex,
                1
            )[0];

        revealedLetters[
            letterIndex
        ] = true;

    }

    updatePassword();

}

function passwordFullyRevealed(){

    return revealedLetters.every(
        x => x
    );

}

function spinOutcome(){

    const wheel =

        wheelTables[
            Math.min(
                currentStageIndex,
                wheelTables.length - 1
            )
        ];

    previousWheelIndex =

        Math.floor(
            Math.random() *
            wheel.length
        );

    return wheel[
        previousWheelIndex
    ];

}

function applyOutcome(
    outcome
){

    document.getElementById(
        "wheelResult"
    ).textContent =
        outcome;

    switch(outcome){

        case "HACK":

            revealRandomLetters(
                1
            );

            logMessage(
                "HACK: Revealed 1 letter"
            );

            break;

        case "ALARM":

            alarms--;

            updateAlarms();

            logMessage(
                "ALARM: Security triggered"
            );

            break;

        case "SAFE":

            logMessage(
                "SAFE: No effect"
            );

            break;

        case "DIFFUSE":

            alarms++;

            updateAlarms();

            logMessage(
                "DIFFUSE: Alarm added"
            );

            break;

        case "DECRYPT":

            revealRandomLetters(
                3
            );

            logMessage(
                "DECRYPT: Revealed 3 letters"
            );

            break;

        case "CAUTION":

            applyCaution();

            break;

    }

    checkStageState();

}

function applyCaution(){

    const wheel =

        wheelTables[
            Math.min(
                currentStageIndex,
                wheelTables.length - 1
            )
        ];

    const nextIndex =
        previousWheelIndex + 1;

    if(
        nextIndex <
        wheel.length &&
        wheel[nextIndex] ===
        "ALARM"
    ){

        alarms -= 3;

        updateAlarms();

        logMessage(
            "CAUTION: Lost 3 alarms"
        );

    }else{

        logMessage(
            "CAUTION: No effect"
        );

    }

}

function checkStageState(){

    if(
        alarms <= 0
    ){

        showModal(
            "SECURITY LOCKDOWN",
            "The vault has reset."
        );

        setTimeout(
            resetStage,
            100
        );

        return;

    }

    if(
        passwordFullyRevealed()
    ){

        completeStage();

    }

}

function resetStage(){

    alarms =
        maxAlarms;

    secretCode =
        generateSecretCode();

    revealedLetters =
        new Array(
            currentStage.password.length
        ).fill(false);

    updateAlarms();

    updatePassword();

    clearHints();

    currentCode = "";

    updateCodeDisplay();

    document.getElementById(
        "wheelResult"
    ).textContent =
        "READY";

    logMessage(
        "Stage reset"
    );

}

async function attemptHack(){

    if(
        currentCode.length !== 4
    ){
        return;
    }

    await playHackAnimation();

    const hints =
        buildHints(
            currentCode,
            secretCode
        );

    showHints(
        hints
    );

    if(
        currentCode ===
        secretCode
    ){

        revealRandomLetters(
            3
        );

        logMessage(
            "CODE CRACKED"
        );

        secretCode =
            generateSecretCode();

        checkStageState();

    }else{

        const outcome =
            spinOutcome();

        applyOutcome(
            outcome
        );

    }

    currentCode = "";

    updateCodeDisplay();

}

function completeStage(){

    document.getElementById(
        "targetImage"
    ).style.filter =
        "blur(0px)";

    showModal(
        "VAULT EXPOSED",
        `Stage ${
            currentStageIndex + 1
        } complete.`
    );

    logMessage(
        `Stage ${
            currentStageIndex + 1
        } complete`
    );

    setTimeout(
        advanceStage,
        300
    );

}

function advanceStage(){

    closeModal();

    currentStageIndex++;

    if(
        currentStageIndex >=
        vaultData.stages.length
    ){

        unlockBonus();

        return;

    }

    loadStage();

}

function unlockBonus(){

    if(
        !vaultData.bonus
    ){

        gameComplete();

        return;

    }

    document.getElementById(
        "backgroundImage"
    ).style.backgroundImage =

        `url("${vaultData.bonus}")`;

    document.getElementById(
        "targetImage"
    ).src =
        vaultData.bonus;

    document.getElementById(
        "targetImage"
    ).style.filter =
        "blur(0px)";

    showModal(
        "BONUS VAULT",
        "Bonus image unlocked."
    );

    logMessage(
        "Bonus image unlocked"
    );

    setTimeout(
        gameComplete,
        300
    );

}

function gameComplete(){

    document.getElementById(
        "modalTitle"
    ).textContent =
        "ALL VAULTS EXPOSED";

    document.getElementById(
        "modalMessage"
    ).textContent =
        "Mission complete.";

    document.getElementById(
        "modal"
    ).style.display =
        "flex";

    document.getElementById(
        "hackBtn"
    ).disabled = true;

    document.getElementById(
        "hackBtn"
    ).style.opacity =
        ".5";

    logMessage(
        "Game complete"
    );

}
