const LOCAL_STORAGE_KEY = 'tcgState';

// Initialize the state if it doesn't exist in localStorage
function initState() {
    let state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (!state) {
        // If no state exists, create a new state with a starting amount of money
        state = {
            money: 10, // Starting money (you can adjust this)
            packs: {
                All: 0,
                Kanto: 0,
                Johto: 0,
                Hoenn: 0,
                Sinnoh: 0,
                Unova: 0,
                Kalos: 0,
                Alola: 0,
                Galar: 0,
                Paldea: 0
            }
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)); // Save to localStorage
    }
    return state;
}

// Function to get the current money from localStorage
function getMoney() {
    const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)); // Fetch state
    return state ? state.money : 0; // Return the money or 0 if the state doesn't exist
}

// Function to add money (used when a purchase happens)
function addMoney(amount) {
    let state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)); // Get current state from localStorage
    if (state) {
        state.money += amount; // Add the specified amount to the money
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)); // Save updated state to localStorage
    }
}

// Update the UI with the current money value
function updateMoneyDisplay() {
    const moneyAmountElement = document.querySelector('.moneyAmount');  // Select the first element with class 'moneyAmount'
    if (moneyAmountElement) {
      const money = getCurrentMoney();  // Get the latest money value from localStorage
      moneyAmountElement.textContent = `${money}`;  // Update the money display with the current money
    }
  }

// Initialize state and display money on page load
document.addEventListener('DOMContentLoaded', () => {
    initState(); // Ensure the state is initialized
    updateMoneyDisplay(); // Update the money display when the page loads
});

