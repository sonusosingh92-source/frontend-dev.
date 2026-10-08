const buttons = document.querySelector(".calculator__buttons");
const expressionDisplay = document.querySelector(".display__expression");
const resultDisplay = document.querySelector(".display__result");

let currentInput = "0";
let previousValue = null;
let activeOperator = null;
let shouldStartNewInput = false;
let hasError = false;

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("The result is outside the supported range.");
  }

  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function render() {
  resultDisplay.textContent = currentInput;

  if (activeOperator && previousValue !== null) {
    const operatorSymbol = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
    }[activeOperator];

    expressionDisplay.textContent =
      `${formatNumber(previousValue)} ${operatorSymbol}`;
  } else {
    expressionDisplay.textContent = "";
  }
}

function clearCalculator() {
  currentInput = "0";
  previousValue = null;
  activeOperator = null;
  shouldStartNewInput = false;
  hasError = false;
  render();
}

function enterNumber(number) {
  if (hasError || shouldStartNewInput) {
    currentInput = number;
    shouldStartNewInput = false;
    hasError = false;
  } else if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  render();
}

function enterDecimal() {
  if (hasError || shouldStartNewInput) {
    currentInput = "0.";
    shouldStartNewInput = false;
    hasError = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  render();
}

function calculate(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) {
        throw new Error("Cannot divide by zero");
      }
      return left / right;
    default:
      return right;
  }
}

function showError(message) {
  currentInput = message;
  previousValue = null;
  activeOperator = null;
  shouldStartNewInput = true;
  hasError = true;
  expressionDisplay.textContent = "";
  resultDisplay.textContent = message;
}

function chooseOperator(operator) {
  if (hasError) {
    return;
  }

  const inputValue = Number(currentInput);

  if (activeOperator && previousValue !== null && !shouldStartNewInput) {
    try {
      currentInput = formatNumber(
        calculate(previousValue, activeOperator, inputValue),
      );
      previousValue = Number(currentInput);
    } catch (error) {
      showError(error.message);
      return;
    }
  } else {
    previousValue = inputValue;
  }

  activeOperator = operator;
  shouldStartNewInput = true;
  render();
}

function performCalculation() {
  if (hasError || activeOperator === null || previousValue === null) {
    return;
  }

  const left = previousValue;
  const right = Number(currentInput);
  const operator = activeOperator;
  const operatorSymbol = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  }[operator];

  try {
    const result = formatNumber(calculate(left, operator, right));
    expressionDisplay.textContent =
      `${formatNumber(left)} ${operatorSymbol} ${formatNumber(right)} =`;
    currentInput = result;
    previousValue = null;
    activeOperator = null;
    shouldStartNewInput = true;
    resultDisplay.textContent = currentInput;
  } catch (error) {
    showError(error.message);
  }
}

function applyAction(action) {
  if (action === "clear") {
    clearCalculator();
    return;
  }

  if (hasError) {
    return;
  }

  switch (action) {
    case "delete":
      if (shouldStartNewInput) {
        currentInput = "0";
        shouldStartNewInput = false;
      } else {
        currentInput = currentInput.length > 1
          ? currentInput.slice(0, -1)
          : "0";
        if (currentInput === "-") {
          currentInput = "0";
        }
      }
      break;
    case "percent":
      currentInput = formatNumber(Number(currentInput) / 100);
      break;
    case "sign":
      currentInput = formatNumber(-Number(currentInput));
      break;
    case "decimal":
      enterDecimal();
      return;
    case "equals":
      performCalculation();
      return;
    default:
      return;
  }

  render();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || !buttons.contains(button)) {
    return;
  }

  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    applyAction(button.dataset.action);
  }
});

render();
