
const keypad = document.getElementById("keypad");

const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const angleModeButton = document.getElementById("angleMode");

let expression = "";
let lastAnswer = 0;
let angleMode = "DEG";
let justCalculated = false;

// Allowed mathematical names
const allowedNames = new Set([
    "sin", "cos", "tan",
    "asin", "acos", "atan",
    "sqrt", "log", "log10",
    "abs", "exp", "pi", "e",
    "ans", "i"
]);

// Update the calculator screen
function updateScreen() {
    expressionDisplay.textContent = expression
        ? expression.replaceAll("*", "×").replaceAll("/", "÷")
        : "0";

    angleModeButton.textContent = angleMode;
}

// Functions for DEG and RAD modes
function createScope() {
    const toRadians = value => value * Math.PI / 180;
    const toDegrees = value => value * 180 / Math.PI;

    return {
        sin: angleMode === "DEG"
            ? value => Math.sin(toRadians(value))
            : Math.sin,

        cos: angleMode === "DEG"
            ? value => Math.cos(toRadians(value))
            : Math.cos,

        tan: angleMode === "DEG"
            ? value => Math.tan(toRadians(value))
            : Math.tan,

        asin: angleMode === "DEG"
            ? value => toDegrees(Math.asin(value))
            : Math.asin,

        acos: angleMode === "DEG"
            ? value => toDegrees(Math.acos(value))
            : Math.acos,

        atan: angleMode === "DEG"
            ? value => toDegrees(Math.atan(value))
            : Math.atan,

        pi: Math.PI,
        e: Math.E,
        ans: lastAnswer,
        i: math.i
    };
}

// Check the expression before calculation
function isAllowedExpression(input) {
    if (input.length > 150) {
        return false;
    }

    const validCharacters = /^[0-9+\-*/^().,%!\sA-Za-z]*$/;

    if (!validCharacters.test(input)) {
        return false;
    }

    const names = input.match(/[A-Za-z]+/g) || [];

    return names.every(name =>
        allowedNames.has(name.toLowerCase())
    );
}

// Add a value to the display
function appendValue(value) {
    const operators = ["+", "-", "*", "/", "^", "%", "!", ")"];

    if (justCalculated && !operators.includes(value)) {
        expression = "";
    }

    justCalculated = false;
    expression += value;

    updateScreen();
}

// Perform the calculation
function calculate() {
    if (!expression) return;

    if (!isAllowedExpression(expression)) {
        resultDisplay.textContent = "Invalid expression";
        return;
    }

    try {
        const answer = math.evaluate(expression, createScope());

        if (typeof answer === "number" && !Number.isFinite(answer)) {
            throw new Error("Invalid result");
        }

        const formattedAnswer = math.format(answer, {
            precision: 12
        });

        resultDisplay.textContent = formattedAnswer;

        lastAnswer = answer;
        expression = formattedAnswer;
        justCalculated = true;

        updateScreen();

    } catch (error) {
        resultDisplay.textContent = "Error: check expression";
    }
}

// Handle calculator buttons
keypad.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        expression = "";
        resultDisplay.textContent = "Ready";
        lastAnswer = 0;
        justCalculated = false;
        updateScreen();
        return;
    }

    if (action === "delete") {
        expression = expression.slice(0, -1);
        justCalculated = false;
        updateScreen();
        return;
    }

    if (action === "calculate") {
        calculate();
        return;
    }

    if (value !== undefined) {
        appendValue(value);
    }
});

// Change DEG and RAD mode
angleModeButton.addEventListener("click", function() {

    angleMode = angleMode === "DEG" ? "RAD" : "DEG";

    updateScreen();
});

// Keyboard support
document.addEventListener("keydown", function(event) {

    if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    if (event.key === "Backspace") {
        expression = expression.slice(0, -1);
        justCalculated = false;
        updateScreen();
        return;
    }

    if (event.key === "Escape") {
        expression = "";
        resultDisplay.textContent = "Ready";
        justCalculated = false;
        updateScreen();
        return;
    }

    if ("0123456789+-*/^().%!".includes(event.key)) {
        appendValue(event.key);
    }
});

// Initial screen
updateScreen();

// Dark and Light theme

const themeToggle = document.getElementById("themeToggle");

// Load previously saved theme
let currentTheme =
    localStorage.getItem("calculatorTheme") || "dark";

function updateTheme() {

    document.body.classList.toggle(
        "light-theme",
        currentTheme === "light"
    );

    themeToggle.textContent =
        currentTheme === "dark" ? "☀️ Light" : "🌙 Dark";
}

// Change theme when clicked
themeToggle.addEventListener("click", function() {

    currentTheme =
        currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("calculatorTheme", currentTheme);

    updateTheme();
});

// Apply saved theme
updateTheme();


// ===============================
// GRAPH PLOTTING FEATURE
// ===============================

const graphExpressionInput =
    document.getElementById("graphExpression");

const plotGraphButton =
    document.getElementById("plotGraph");

const graphCanvas =
    document.getElementById("graphCanvas");

const graphMessage =
    document.getElementById("graphMessage");

// Allowed mathematical names
const allowedGraphNames = new Set([
    "x",
    "sin",
    "cos",
    "tan",
    "sqrt",
    "log",
    "log10",
    "abs",
    "exp",
    "pi",
    "e"
]);

// Plot graph when button is clicked
plotGraphButton.addEventListener("click", function() {

    const input = graphExpressionInput.value.trim();

    graphMessage.textContent = "";

    // Check empty input
    if (!input) {
        graphMessage.textContent =
            "Please enter a mathematical function.";
        return;
    }

    // Check allowed characters
    const validCharacters =
        /^[0-9xX+\-*/^().,\sA-Za-z]*$/;

    if (!validCharacters.test(input)) {
        graphMessage.textContent =
            "Please enter a valid mathematical function.";
        return;
    }

    // Check mathematical names
    const names = input.match(/[A-Za-z]+/g) || [];

    const namesAreAllowed = names.every(name =>
        allowedGraphNames.has(name.toLowerCase())
    );

    if (!namesAreAllowed) {
        graphMessage.textContent =
            "Unsupported function or variable.";
        return;
    }

    try {

        if (typeof Plotly === "undefined") {
            throw new Error("Plotly library is not loaded.");
        }

        // Use lowercase x
        const normalizedInput =
            input.replace(/\bX\b/g, "x");

        // Compile the mathematical expression once
        const compiled = math.compile(normalizedInput);

        const xValues = [];
        const yValues = [];

        // Calculate graph points from -10 to +10
        for (let i = 0; i <= 400; i++) {

            const x = -10 + i * 0.05;

            const y = compiled.evaluate({
                x: x
            });

            xValues.push(x);

            // Skip invalid, infinite or complex values
            if (
                typeof y === "number" &&
                Number.isFinite(y)
            ) {
                yValues.push(y);
            } else {
                yValues.push(null);
            }
        }

        // Select graph colours
        const isLight =
            document.body.classList.contains("light-theme");

        const textColor = isLight ? "#172337" : "#ffffff";

        const backgroundColor =
            isLight ? "#ffffff" : "#101827";

        // Create graph
        const graphData = [{
            x: xValues,
            y: yValues,
            type: "scatter",
            mode: "lines",
            name: "f(x)",
            line: {
                color: "#26a69a",
                width: 3
            },
            connectgaps: false
        }];

        const graphLayout = {

            title: {
                text: "f(x) = " + normalizedInput,
                font: {
                    color: textColor
                }
            },

            paper_bgcolor: backgroundColor,
            plot_bgcolor: backgroundColor,

            font: {
                color: textColor
            },

            xaxis: {
                title: "X Axis",
                zeroline: true,
                gridcolor: isLight ? "#dce3eb" : "#34465f"
            },

            yaxis: {
                title: "Y Axis",
                zeroline: true,
                gridcolor: isLight ? "#dce3eb" : "#34465f"
            },

            autosize: true,
            margin: {
                l: 50,
                r: 20,
                t: 55,
                b: 50
            }
        };

        const graphConfig = {
            responsive: true,
            displaylogo: false
        };

        // Display graph
        Plotly.newPlot(
            graphCanvas,
            graphData,
            graphLayout,
            graphConfig
        );

    } catch (error) {

        graphMessage.textContent =
            "Unable to draw graph. Check your equation.";

        console.error(error);
    }
});
