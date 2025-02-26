const LOCAL_STORAGE_KEY = 'tcgState';  // Consistent localStorage key

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

// Get the current money from localStorage
function getCurrentMoney() {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  return state ? state.money : 100; // Default to 100 if no state is found
}

// Get the current pack quantities from localStorage
function getPackQuantities() {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  return state ? state.packs : {};  // Return the packs object
}

// Update the pack quantities in localStorage
function updatePackQuantities(packs) {
  const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
  state.packs = packs;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

// Display the current pack quantities
function displayPacks() {
  const packs = getPackQuantities();  // Get the pack quantities from localStorage
  const packContainer = document.getElementById('packs-container');  // Get the container to display packs

  if (!packContainer) {
    console.error("packs-container not found in the DOM");
    return;  // Exit if the container doesn't exist
  }

  // Clear the container before adding new content
  packContainer.innerHTML = '';

  // Iterate over the packs and display each one
  for (let region in packs) {
    // Exclude the 'regionAll' entry if you don't want it
    if (region === "regionAll") {
      continue;
    }

    const packDiv = document.createElement('div');
    packDiv.classList.add('packs-items');

    // Remove "region" prefix from the region name (e.g., "regionAll" -> "All")
    const regionName = region.replace(/^region/, '');

    const packImage = document.createElement('img');
    // Set the image source using the cleaned region name
    packImage.src = `/images/${regionName}.jpg`;  
    packImage.alt = `/images/${regionName} pack`;

    const packQuantity = document.createElement('span');
    packQuantity.classList.add('quantity');
    packQuantity.textContent = `Owned: ${packs[region]}`;

    // Add a click event listener to open the pack
    (function (regionCopy) {
      packDiv.addEventListener('click', () => openPackCanvas(regionCopy, packs));
    })(region);  // Pass the current region to the IIFE

    // Append the image and quantity to the pack div
    packDiv.appendChild(packImage);
    packDiv.appendChild(packQuantity);

    // Append the pack div to the container
    packContainer.appendChild(packDiv);
  }

}

function openPackCanvas(regionName, packs) {
  // Check if the selected pack has a quantity greater than 0
  if (packs[regionName] > 0) {
    // Decrease the quantity of the selected pack by 1
    packs[regionName] -= 1;

    // Save updated pack quantities to localStorage
    updatePackQuantities(packs);

    // Manually update the UI to reflect the new pack quantity
    displayPacks();

    // Create a canvas overlay (you can replace this with a modal or another element)
    const canvas = document.createElement('div');
    canvas.classList.add('canvas-overlay');

    canvas.addEventListener('click', () => {
      closePackCanvas(canvas);
    });

    // Create a close button (X)
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent the canvas click event from triggering
      closePackCanvas(canvas);
    });

    // Add the close button to the canvas
    canvas.appendChild(closeButton);

    // Fetch the booster pack cards for the selected region from the backend
    fetch(`http://localhost:3000/booster-pack/${regionName}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.boosterPack) {
          // Create the card list and display the cards
          const cardList = document.createElement('div');
          cardList.classList.add('card-list');

          // Iterate over the booster pack cards
          data.boosterPack.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');

            // Add the card HTML
            cardDiv.innerHTML = `
              <img src="${card.image_url}" alt="${card.name}">
              <div class="card-name">${card.name}</div>
              <div class="rarity">${card.card_value}</div>
            `;

            // Check if the card's pull_amount is 1 (First Pull)
            if (card.pull_amount === 0) {
              const firstPullTag = document.createElement('span');
              firstPullTag.classList.add('first-pull-tag');
              firstPullTag.textContent = 'First Pull';
              cardDiv.appendChild(firstPullTag);
            }

            // Append the card to the list
            cardList.appendChild(cardDiv);
          });

          // Append the card list to the canvas
          canvas.appendChild(cardList);
        } else {
          console.error('Failed to fetch booster pack:', data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching booster pack:', error);
      });

    // Add the canvas overlay to the body (or any other container)
    document.body.appendChild(canvas);
  } else {
    alert("No available packs!");
  }
}

// Close the canvas
function closePackCanvas(canvas) {
  canvas.remove();  // Remove the canvas overlay from the DOM
}

function updateMoneyDisplay() {
  const moneyAmountElement = document.querySelector('.moneyAmount');  // Select the first element with class 'moneyAmount'
  if (moneyAmountElement) {
    const money = getCurrentMoney();  // Get the latest money value from localStorage
    moneyAmountElement.textContent = `${money}`;  // Update the money display with the current money
  }
}

// Initialize the page with the pack display
document.addEventListener('DOMContentLoaded', () => {
  displayPacks();  // Show packs when the page loads
  updateMoneyDisplay(); // Show the current money when the page loads
});
