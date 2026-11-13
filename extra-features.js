
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
