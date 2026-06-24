const STORAGE_KEY = "fabioBudgetPlanner";

const weekNameInput = document.getElementById("weekName");
const savingGoalInput = document.getElementById("savingGoal");
const saveWeekBtn = document.getElementById("saveWeekBtn");

const transactionNameInput = document.getElementById("transactionName");
const transactionAmountInput = document.getElementById("transactionAmount");
const transactionTypeInput = document.getElementById("transactionType");
const transactionCategoryInput = document.getElementById("transactionCategory");
const addTransactionBtn = document.getElementById("addTransactionBtn");

const currentWeekTitle = document.getElementById("currentWeekTitle");
const transactionTable = document.getElementById("transactionTable");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const balanceEl = document.getElementById("balance");
const savingsProgressEl = document.getElementById("savingsProgress");

const savingGoalText = document.getElementById("savingGoalText");
const progressFill = document.getElementById("progressFill");
const resetBtn = document.getElementById("resetBtn");

let budgetData = {
  weekName: "",
  savingGoal: 0,
  transactions: []
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD"
  }).format(amount);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetData));
}

function loadData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    budgetData = JSON.parse(savedData);
  }
}

function calculateTotals() {
  const totalIncome = budgetData.transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = budgetData.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    balance
  };
}

function updateSummary() {
  const { totalIncome, totalExpenses, balance } = calculateTotals();

  totalIncomeEl.textContent = formatCurrency(totalIncome);
  totalExpensesEl.textContent = formatCurrency(totalExpenses);
  balanceEl.textContent = formatCurrency(balance);

  balanceEl.classList.remove("positive", "negative", "warning");

  if (balance > 0) {
    balanceEl.classList.add("positive");
  } else if (balance < 0) {
    balanceEl.classList.add("negative");
  } else {
    balanceEl.classList.add("warning");
  }

  const savingGoal = Number(budgetData.savingGoal) || 0;
  const progress = savingGoal > 0 ? Math.min((balance / savingGoal) * 100, 100) : 0;

  savingsProgressEl.textContent = `${Math.max(Math.round(progress), 0)}%`;
  savingGoalText.textContent = `${formatCurrency(Math.max(balance, 0))} / ${formatCurrency(savingGoal)}`;
  progressFill.style.width = `${Math.max(progress, 0)}%`;
}

function renderTransactions() {
  if (budgetData.transactions.length === 0) {
    transactionTable.innerHTML = `
      <tr>
        <td colspan="5" class="empty-row">No transactions yet.</td>
      </tr>
    `;
    return;
  }

  transactionTable.innerHTML = "";

  budgetData.transactions.forEach((transaction) => {
    const row = document.createElement("tr");

    const typeClass = transaction.type === "income" ? "type-income" : "type-expense";
    const amountClass = transaction.type === "income" ? "amount-income" : "amount-expense";
    const amountPrefix = transaction.type === "income" ? "+" : "-";

    row.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.category}</td>
      <td class="${typeClass}">${transaction.type}</td>
      <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
      <td>
        <button class="delete-btn" data-id="${transaction.id}">Delete</button>
      </td>
    `;

    transactionTable.appendChild(row);
  });

  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const transactionId = Number(button.dataset.id);

      budgetData.transactions = budgetData.transactions.filter(
        (transaction) => transaction.id !== transactionId
      );

      saveData();
      renderApp();
    });
  });
}

function renderWeek() {
  currentWeekTitle.textContent = budgetData.weekName || "No week saved yet";
  weekNameInput.value = budgetData.weekName;
  savingGoalInput.value = budgetData.savingGoal || "";
}

function renderApp() {
  renderWeek();
  renderTransactions();
  updateSummary();
}

saveWeekBtn.addEventListener("click", () => {
  const weekName = weekNameInput.value.trim();
  const savingGoal = Number(savingGoalInput.value);

  if (!weekName) {
    alert("Please enter a week name.");
    return;
  }

  if (savingGoal < 0) {
    alert("Savings goal cannot be negative.");
    return;
  }

  budgetData.weekName = weekName;
  budgetData.savingGoal = savingGoal;

  saveData();
  renderApp();
});

addTransactionBtn.addEventListener("click", () => {
  const name = transactionNameInput.value.trim();
  const amount = Number(transactionAmountInput.value);
  const type = transactionTypeInput.value;
  const category = transactionCategoryInput.value;

  if (!name) {
    alert("Please enter a transaction name.");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    name,
    amount,
    type,
    category
  };

  budgetData.transactions.push(newTransaction);

  transactionNameInput.value = "";
  transactionAmountInput.value = "";
  transactionTypeInput.value = "income";
  transactionCategoryInput.value = "Income";

  saveData();
  renderApp();
});

resetBtn.addEventListener("click", () => {
  const confirmed = confirm("Are you sure you want to delete all budget data?");

  if (!confirmed) {
    return;
  }

  budgetData = {
    weekName: "",
    savingGoal: 0,
    transactions: []
  };

  saveData();
  renderApp();
});

loadData();
renderApp();