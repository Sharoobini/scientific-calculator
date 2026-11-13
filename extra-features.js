
// 1. CALCULATOR MEMORY

let calculatorMemory = Number(
    localStorage.getItem("calculatorMemory") || 0
);

const memoryStatus = document.getElementById("memoryStatus");

function updateMemoryDisplay() {
    memoryStatus.textContent = "Memory: " + calculatorMemory;
}

function getCurrentAnswer() {
    const value = resultDisplay.textContent.trim();
    const number = Number(value);

    if (!value || value === "Ready" || !Number.isFinite(number)) {
        throw new Error("Please calculate a valid number first.");
    }

    return number;
}

document.querySelectorAll("[data-memory]").forEach(button => {

    button.addEventListener("click", function() {

        const action = button.dataset.memory;

        try {

            if (action === "clear") {
                calculatorMemory = 0;
            }

            else if (action === "recall") {
                appendValue(String(calculatorMemory));
            }

            else if (action === "add") {
                calculatorMemory += getCurrentAnswer();
            }

            else if (action === "subtract") {
                calculatorMemory -= getCurrentAnswer();
            }

            localStorage.setItem(
                "calculatorMemory",
                String(calculatorMemory)
            );

            updateMemoryDisplay();

        } catch (error) {
            memoryStatus.textContent = error.message;
        }

    });

});

updateMemoryDisplay();


// 2. STEP-BY-STEP SOLUTIONS

const showStepsButton = document.getElementById("showSteps");
const stepsList = document.getElementById("stepsList");

showStepsButton.addEventListener("click", function() {

    stepsList.replaceChildren();

    const latestHistory = historyList.querySelector(".history-item");

    if (!latestHistory) {
        const item = document.createElement("li");
        item.textContent = "Please calculate something first.";
        stepsList.appendChild(item);
        return;
    }

    const oldExpression =
        latestHistory.querySelector(".history-expression").textContent;

    const oldResult =
        latestHistory.querySelector(".history-result").textContent;

    const match = oldExpression.match(
        /^\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*([+\-*/^])\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*$/
    );

    function addStep(text) {
        const item = document.createElement("li");
        item.textContent = text;
        stepsList.appendChild(item);
    }

    if (!match) {
        addStep("Expression: " + oldExpression);
        addStep("Final answer: " + oldResult);
        addStep(
            "Detailed steps are currently available only for simple two-number operations."
        );
        return;
    }

    const first = Number(match[1]);
    const operator = match[2];
    const second = Number(match[3]);

    const names = {
        "+": "Addition",
        "-": "Subtraction",
        "*": "Multiplication",
        "/": "Division",
        "^": "Power"
    };

    addStep("Original expression: " + oldExpression);

    addStep(
        "Step 1: Identify the two numbers: " +
        first + " and " + second + "."
    );

    addStep(
        "Step 2: Apply " + names[operator] + "."
    );

    addStep(
        "Step 3: " + first + " " + operator + " " +
        second + " = " + oldResult
    );

    addStep("Final Answer: " + oldResult);

});



// 3. UNIT CONVERTER

const unitCategory = document.getElementById("unitCategory");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");

const unitInput = document.getElementById("unitInput");
const unitResult = document.getElementById("unitResult");

const unitDefinitions = {

    length: {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        inch: 0.0254,
        ft: 0.3048,
        mile: 1609.344
    },

    mass: {
        mg: 0.000001,
        g: 0.001,
        kg: 1,
        lb: 0.45359237
    },

    temperature: {
        C: 1,
        F: 1,
        K: 1
    }

};

function populateUnits() {

    const category = unitCategory.value;
    const units = Object.keys(unitDefinitions[category]);

    fromUnit.replaceChildren();
    toUnit.replaceChildren();

    units.forEach(unit => {

        fromUnit.add(new Option(unit, unit));
        toUnit.add(new Option(unit, unit));

    });

    if (category === "length") {
        fromUnit.value = "m";
        toUnit.value = "km";
    }

    if (category === "mass") {
        fromUnit.value = "kg";
        toUnit.value = "g";
    }

    if (category === "temperature") {
        fromUnit.value = "C";
        toUnit.value = "F";
    }

    unitResult.textContent = "Select units and enter a value.";

}

unitCategory.addEventListener("change", populateUnits);

function convertTemperature(value, from, to) {

    let celsius;

    if (from === "C") {
        celsius = value;
    }

    else if (from === "F") {
        celsius = (value - 32) * 5 / 9;
    }

    else {
        celsius = value - 273.15;
    }

    if (to === "C") return celsius;

    if (to === "F") return celsius * 9 / 5 + 32;

    return celsius + 273.15;

}

document.getElementById("convertUnit").addEventListener(
    "click",
    function() {

        const value = Number(unitInput.value);
        const category = unitCategory.value;

        if (unitInput.value.trim() === "" || !Number.isFinite(value)) {
            unitResult.textContent = "Please enter a valid number.";
            return;
        }

        const from = fromUnit.value;
        const to = toUnit.value;

        let answer;

        if (category === "temperature") {

            answer = convertTemperature(value, from, to);

        } else {

            const baseValue =
                value * unitDefinitions[category][from];

            answer =
                baseValue / unitDefinitions[category][to];

        }

        unitResult.textContent =
            value + " " + from + " = " +
            Number(answer.toFixed(8)) + " " + to;

    }
);

populateUnits();
