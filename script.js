
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
