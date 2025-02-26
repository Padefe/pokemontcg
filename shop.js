const prices = {
  All: 9.25,
  Kanto: 45.34,
  Johto: 20.12,
  Hoenn: 6.56,
  Sinnoh: 3.86,
  Unova: 1.33,
  Kalos: 2.21,
  Alola: 0.94,
  Galar: 0.45,
  Paldea: 2.51
};

// Initialize the state in localStorage if it doesn't exist
function initializeState() {
  let state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (!state) {
    // Set initial state with money and packs
    state = {
      money: 10, // Starting money (you can adjust as needed)
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

// Get the current pack quantities from localStorage
function getPackQuantities() {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  return state ? state.packs : {};
}

// Update pack quantities in localStorage
function updatePackQuantity(region, amount) {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (state && state.packs) {
    state.packs[region] += amount; // Update pack quantity for the region
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)); // Save the updated state
  }
}

// Get the current money from localStorage
function getCurrentMoney() {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  return state ? state.money : 100; // Default to 100 if no state is found
}

// Add money to the account
function addMoneyToAccount(amount) {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (state) {
    state.money += amount; // Add the specified amount to the current money
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)); // Save the updated state
  }
}

// Display the packs with their prices and quantities
function displayPacks() {
  const packs = getPackQuantities();
  const packContainer = document.getElementById('pack-container');

  // Clear the container before adding new content
  packContainer.innerHTML = '';

  for (let region in prices) {
    const regionKey = `${region}`;
    const packDiv = document.createElement('div');
    packDiv.classList.add('pack-item');

    const packImage = document.createElement('img');
    packImage.src = `${region}.jpg`;  // Ensure images exist for each region
    packImage.alt = `${region} pack`;

    const packPrice = document.createElement('span');
    packPrice.classList.add('price');
    packPrice.textContent = `$${prices[region]}`;

    const packQuantity = document.createElement('span');
    packQuantity.classList.add('quantity');
    packQuantity.textContent = `Owned: ${packs[regionKey]}`;

    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-btn');
    buyButton.textContent = `Buy 1 ${region.charAt(0).toUpperCase() + region.slice(1)} Pack`;

    const buyDisplay = document.createElement('button');
    buyDisplay.classList.add('buyD-btn');
    buyDisplay.textContent = `Buy display box (24) ${region.charAt(0).toUpperCase() + region.slice(1)}`;

    // Check if the user has enough money before enabling the button
    buyButton.addEventListener('click', () => purchasePack(region));

    // Check if the user has enough money before enabling the button
    buyDisplay.addEventListener('click', () => purchaseDisplay(region));

    if (getCurrentMoney() < prices[region]) {
      buyButton.disabled = true;
    }

    if (getCurrentMoney() < prices[region] * 24) {
      buyDisplay.disabled = true;
    }

    packDiv.appendChild(packImage);
    packDiv.appendChild(packPrice);
    packDiv.appendChild(packQuantity);
    packDiv.appendChild(buyButton);
    packDiv.appendChild(buyDisplay);
    packContainer.appendChild(packDiv);
  }
}

// Handle purchasing a pack
function purchasePack(region) {
  const packPrice = prices[region];
  const currentMoney = getCurrentMoney();

  if (currentMoney >= packPrice) {
    // Deduct money and update pack quantity
    const newMoney = currentMoney - packPrice;
    updateMoney(newMoney); // Save the new money to localStorage
    updatePackQuantity(`${region}`, 1); // Update the quantity of the selected pack

    displayPacks();  // Update the UI
    updateMoneyDisplay();   // Update the money display
  } else {
    alert('Not enough money!');
  }
}

// Handle purchasing a pack
function purchaseDisplay(region) {
  const displayPrice = prices[region] * 24;
  const currentMoney = getCurrentMoney();

  if (currentMoney >= displayPrice) {
    // Deduct money and update pack quantity
    const newMoney = currentMoney - displayPrice;
    updateMoney(newMoney); // Save the new money to localStorage
    updatePackQuantity(`${region}`, 24); // Update the quantity of the selected pack

    displayPacks();  // Update the UI
    updateMoneyDisplay();   // Update the money display
  } else {
    alert('Not enough money!');
  }
}

// Update the money stored in localStorage
function updateMoney(amount) {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (state) {
    state.money = amount.toFixed(2);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
}

// Update the displayed money on the page
function updateMoneyDisplay() {
  const moneyAmountElement = document.querySelector('.moneyAmount');  // Select the first element with class 'moneyAmount'
  if (moneyAmountElement) {
    const money = getCurrentMoney();  // Get the latest money value from localStorage
    moneyAmountElement.textContent = `${money}`;  // Update the money display with the current money
  }
}
// Initialize the page with the pack display and money
document.addEventListener('DOMContentLoaded', () => {
  initializeState(); // Ensure state is initialized
  displayPacks(); // Show packs when the page loads
  updateMoneyDisplay(); // Show the current money when the page loads
});
