
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


// 4. EQUATION SOLVER

const solveEquationButton =
    document.getElementById("solveEquation");

const equationResult =
    document.getElementById("equationResult");

function formatNumber(number) {
    return Number(number.toFixed(8)).toString();
}

solveEquationButton.addEventListener("click", function() {

    const a = Number(document.getElementById("coefA").value);
    const b = Number(document.getElementById("coefB").value);
    const c = Number(document.getElementById("coefC").value);

    if (![a, b, c].every(Number.isFinite)) {
        equationResult.textContent = "Enter valid coefficients.";
        return;
    }

    // Linear equation: bx + c = 0
    if (Math.abs(a) < 1e-12) {

        if (Math.abs(b) < 1e-12) {

            equationResult.textContent =
                Math.abs(c) < 1e-12
                    ? "Every value of x is a solution."
                    : "No solution.";

            return;
        }

        const root = -c / b;

        equationResult.textContent =
            "Linear equation detected.\n" +
            "x = -c / b\n" +
            "x = " + formatNumber(root);

        return;
    }

    // Quadratic equation
    const discriminant = b * b - 4 * a * c;

    if (discriminant > 0) {

        const root1 =
            (-b + Math.sqrt(discriminant)) / (2 * a);

        const root2 =
            (-b - Math.sqrt(discriminant)) / (2 * a);

        equationResult.textContent =
            "Discriminant = " + formatNumber(discriminant) +
            "\nTwo real roots found." +
            "\nx1 = " + formatNumber(root1) +
            "\nx2 = " + formatNumber(root2);

    }

    else if (Math.abs(discriminant) < 1e-12) {

        const root = -b / (2 * a);

        equationResult.textContent =
            "Discriminant = 0" +
            "\nOne repeated real root." +
            "\nx = " + formatNumber(root);

    }

    else {

        const realPart = -b / (2 * a);

        const imaginaryPart =
            Math.sqrt(-discriminant) / (2 * Math.abs(a));

        equationResult.textContent =
            "Discriminant = " + formatNumber(discriminant) +
            "\nTwo complex roots found." +
            "\nx1 = " + formatNumber(realPart) +
            " + " + formatNumber(imaginaryPart) + "i" +
            "\nx2 = " + formatNumber(realPart) +
            " - " + formatNumber(imaginaryPart) + "i";

    }

});

// 5. COPY ANSWER

const copyAnswerButton =
    document.getElementById("copyAnswer");

const copyStatus =
    document.getElementById("copyStatus");

copyAnswerButton.addEventListener("click", async function() {

    const answer = resultDisplay.textContent.trim();

    if (!answer || answer === "Ready" ||
        answer.startsWith("Error") ||
        answer === "Invalid expression") {

        copyStatus.textContent = "Please calculate an answer first.";
        return;
    }

    try {

        await navigator.clipboard.writeText(answer);

        copyStatus.textContent = "Answer copied successfully!";

    } catch (error) {

        copyStatus.textContent =
            "Copy failed. Please check browser permissions.";

    }

});

// 6. MULTIPLE GRAPH PLOTTING

const multipleGraphInput =
    document.getElementById("multiGraphExpressions");

const drawMultipleGraphsButton =
    document.getElementById("drawMultipleGraphs");

const multipleGraphCanvas =
    document.getElementById("multipleGraphCanvas");

const multiGraphMessage =
    document.getElementById("multiGraphMessage");

const allowedGraphFunctions = new Set([
    "x", "sin", "cos", "tan",
    "sqrt", "log", "log10",
    "abs", "exp", "pi", "e"
]);

drawMultipleGraphsButton.addEventListener("click", function() {

    multiGraphMessage.textContent = "";

    if (typeof Plotly === "undefined") {
        multiGraphMessage.textContent =
            "Plotly library is not available. Check your internet connection.";
        return;
    }

    const equations = multipleGraphInput.value
        .split("\n")
        .map(item => item.trim())
        .filter(Boolean);

    if (equations.length === 0) {
        multiGraphMessage.textContent =
            "Enter at least one equation.";
        return;
    }

    if (equations.length > 5) {
        multiGraphMessage.textContent =
            "You can compare a maximum of five equations.";
        return;
    }

    try {

        const graphData = [];

        equations.forEach((equation, index) => {

            const normalized =
                equation.replace(/\bX\b/g, "x");

            if (normalized.length > 100) {
                throw new Error("Equation is too long.");
            }

            const validCharacters =
                /^[0-9x+\-*/^().,\sA-Za-z]*$/;

            if (!validCharacters.test(normalized)) {
                throw new Error("Invalid characters in equation.");
            }

            const names = normalized.match(/[A-Za-z]+/g) || [];

            const allowed = names.every(name =>
                allowedGraphFunctions.has(name.toLowerCase())
            );

            if (!allowed) {
                throw new Error("Unsupported function in equation.");
            }

            const compiled = math.compile(normalized);

            const xValues = [];
            const yValues = [];

            for (let i = 0; i <= 200; i++) {

                const x = -10 + i * 0.1;

                const y = compiled.evaluate({ x: x });

                xValues.push(x);

                yValues.push(
                    typeof y === "number" && Number.isFinite(y)
                        ? y
                        : null
                );
            }

            graphData.push({
                x: xValues,
                y: yValues,
                type: "scatter",
                mode: "lines",
                name: "f(x) = " + normalized
            });

        });

        const isLight =
            document.body.classList.contains("light-theme");

        Plotly.newPlot(
            multipleGraphCanvas,
            graphData,
            {
                title: "Function Comparison",
                paper_bgcolor: isLight ? "#ffffff" : "#101827",
                plot_bgcolor: isLight ? "#ffffff" : "#101827",
                font: {
                    color: isLight ? "#172337" : "#ffffff"
                },
                xaxis: {
                    title: "X Axis"
                },
                yaxis: {
                    title: "Y Axis"
                },
                autosize: true,
                margin: {
                    l: 45,
                    r: 15,
                    t: 50,
                    b: 45
                }
            },
            {
                responsive: true,
                displaylogo: false
            }
        );

    } catch (error) {

        multiGraphMessage.textContent =
            "Unable to draw graphs: " + error.message;

    }

});
