const colorsStored = [
    "red",
    "blue",
    "green",
    "yellow"
]

function initializeGlasses(numGlasses, numColors, glassCapacity, numEmptyGlasses) {
    let glasses = [];
    let colors = Array.from({ length: numColors }, (_, i) => colorsStored[i]);

    // Start by filling some glasses with colors
    for (let i = 0; i < numGlasses - numEmptyGlasses; i++) {
        let glass = Array(glassCapacity).fill(colors[i % numColors]);
        glasses.push(glass);
    }

    // Add empty glasses
    for (let i = 0; i < numEmptyGlasses; i++) {
        glasses.push([]); // Empty glasses
    }

    return glasses;
}

// Pour color from one glass to another
function pourColor(from, to, amount) {


    let pourAmount = amount;
    for (let i = 0; i < pourAmount; i++) {
        to.push(from.pop());
    }
}

function shuffleNonempty(numGlasses) {

    let filledcans = [0, 1, 2]
    let nonFilledCans = [3, 4];
    let swapCanIdx = 0;
    let emptyCanIdx = 0;
    pourColor(numGlasses[filledcans[swapCanIdx]], numGlasses[nonFilledCans[emptyCanIdx]], 1)
    filledcans.splice(swapCanIdx, 1);
    swapCanIdx = 0
    emptyCanIdx = 1;
    pourColor(numGlasses[filledcans[swapCanIdx]], numGlasses[nonFilledCans[emptyCanIdx]], 1);
    filledcans.splice(swapCanIdx, 1);
    swapCanIdx = 0
    emptyCanIdx = Math.floor(Math.random() * 2);
    pourColor(numGlasses[filledcans[swapCanIdx]], numGlasses[nonFilledCans[emptyCanIdx]], 1);
    filledcans = [0, 1, 2]
    swapCanIdx = Math.floor(Math.random() * 3);
    emptyCanIdx = Math.floor(Math.random() * 2);
    pourColor(numGlasses[filledcans[swapCanIdx]], numGlasses[nonFilledCans[emptyCanIdx]], 1);
    swapCanIdx = Math.floor(Math.random() * 3);
    emptyCanIdx = Math.floor(Math.random() * 2);
    pourColor(numGlasses[filledcans[swapCanIdx]], numGlasses[nonFilledCans[emptyCanIdx]], 1);
}

function shuffleFilled(numGlasses, level, qty = 1) {
    let cans = [0, 1, 2, 3, 4];
    let swapCanIdx1 = cans[Math.floor(Math.random() * 5)];
    cans.splice(swapCanIdx1, 1)
    let swapCanIdx2 = cans[Math.floor(Math.random() * 4)];
    const fromArray = numGlasses[swapCanIdx1]
    const toArray = numGlasses[swapCanIdx2]
    if (fromArray.length >= qty && toArray.length <= (4 - qty)) {
        pourColor(fromArray, toArray, qty);
        return "performed";
    }
    return "notPerformed"
}

export function generateInitialState(numGlasses, numColors, glassCapacity, numEmptyGlasses,level) {
    let glasses = initializeGlasses(numGlasses, numColors, glassCapacity, numEmptyGlasses);

    shuffleNonempty(glasses)
    let iteration = (level-1)*25;
    while (iteration > 0) {
        let res = shuffleFilled(glasses, level, 1)
        if (res === "performed") {
            iteration -= 1;
        }
    }
    return glasses;
}

export function exportInitialGlasses(level){
    let numGlasses = 5;        
    let numColors = 3;        
    let glassCapacity = 4;     
    let numEmptyGlasses = 2; 
    let initialState = generateInitialState(numGlasses, numColors, glassCapacity, numEmptyGlasses, level);
    return initialState
}

  


