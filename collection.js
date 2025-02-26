const LOCAL_STORAGE_KEY = 'tcgState';

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
// Function to fetch and display all cards or only collected cards
let showAllCards = false;

async function fetchCollection() {
    try {
        const response = await fetch('http://localhost:3000/collection');
        const data = await response.json();

        if (data.success && data.collection) {
            displayCollection(data.collection);
        } else {
            console.error('Error fetching collection:', data.message);
        }
    } catch (error) {
        console.error('Error fetching collection:', error);
    }
}

// Get the current money from localStorage
function getCurrentMoney() {
    const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log("State fetched from localStorage:", state);
    return state ? state.money : 100; // Default to 100 if no state is found
}

// Function to display cards based on the current toggle
function displayCollection(cards) {
    const collectionDiv = document.getElementById('collection');
    collectionDiv.innerHTML = ''; // Clear the current content

    let filteredCards = cards;

    // Filter cards based on the toggle status
    if (!showAllCards) {
        filteredCards = cards.filter(card => card.pull_amount > 0);
    }

    // Count cards with pull_amount > 0
    const collectedCardsCount = cards.filter(card => card.pull_amount > 0).length;

    // Update the collected cards counter display
    const collectedCountElement = document.getElementById('collectedCount');
    if (collectedCountElement) {
        collectedCountElement.textContent = `Collected Cards: ${collectedCardsCount} /1025`;
    }

    filteredCards.forEach(card => {
        const cardItem = document.createElement('div');
        cardItem.classList.add('card-item');

        // If showing all cards and the pull_amount is less than 1, apply the gray-out class
        if (showAllCards && card.pull_amount < 1) {
            cardItem.classList.add('grayed-out');
        }

        const cardImage = document.createElement('img');
        cardImage.src = card.image_url;
        cardImage.alt = card.name;
        cardImage.classList.add('card-image');

        const cardName = document.createElement('p');
        cardName.textContent = card.name;

        const cardRegion = document.createElement('p');
        cardRegion.textContent = card.region;

        const cardValue = document.createElement('p');
        cardValue.textContent = `$${card.card_value}`;

        const cardAmount = document.createElement('p');
        cardAmount.textContent = `Total collected: ${card.pull_amount}`;

        if (card.pull_amount > 0) {
            const sellBtn = document.createElement('button');
            sellBtn.textContent = 'Sell';
            sellBtn.classList.add('sell-btn');
            sellBtn.onclick = () => sellCard(card.name, card.card_value);

            cardItem.appendChild(sellBtn);
        }


        cardItem.appendChild(cardImage);
        cardItem.appendChild(cardName);
        cardItem.appendChild(cardRegion);
        cardItem.appendChild(cardValue);
        cardItem.appendChild(cardAmount);


        collectionDiv.appendChild(cardItem);
    });

}

// Handle selling a card
async function sellCard(cardName, cardValue) {
    const currentMoney = await getCurrentMoney(); // Fetch current money from the backend

    // Fetch the card details from the database
    const card = await getCardByName(cardName);

    if (card && card.pull_amount > 0) {
        // Calculate the new money amount
        const newMoney = parseFloat(currentMoney) + parseFloat(cardValue);

        // Update the money and card pull_amount via API
        const updated = await updateCardPullAmount(cardName, card.pull_amount - 1);

        if (updated) {
            await updateMoney(newMoney); // Update user's money

            // Log the updated status
            console.log("New Money after selling: $" + newMoney);

            // Update the collection view and money display
            fetchCollection();
            updateMoneyDisplay(); // Update the money display

        } else {
            alert("There was an error updating the card.");
        }
    } else {
        alert('You don\'t have enough of this card to sell!');
    }
}

// Function to sell all duplicate cards (cards with pull_amount > 1)
async function sellAllDuplicates() {
    try {
        const response = await fetch('http://localhost:3000/collection');
        const data = await response.json();

        if (data.success && data.collection) {
            // Filter cards with pull_amount > 1
            const duplicates = data.collection.filter(card => card.pull_amount > 1);

            // Sell each duplicate card
            for (const card of duplicates) {
                const currentMoney = await getCurrentMoney();
                const newMoney = parseFloat(currentMoney) + parseFloat(card.card_value) * (card.pull_amount - 1);

                // Update the card's pull amount to 1 (keep one copy)
                const updated = await updateCardPullAmount(card.name, 1);

                if (updated) {
                    await updateMoney(newMoney);
                }
            }

            // Update the collection and money display
            fetchCollection();
            updateMoneyDisplay();
            alert('Duplicates sold!');
        } else {
            alert('No duplicates found.');
        }
    } catch (error) {
        console.error('Error selling duplicates:', error);
        alert('An error occurred while selling duplicates.');
    }
}

// Attach the event listener to the button
document.getElementById('sellDuplicates').addEventListener('click', sellAllDuplicates);

// Function to sell all cards (including all copies)
async function sellAllCards() {
    try {
        const response = await fetch('http://localhost:3000/collection');
        const data = await response.json();

        if (data.success && data.collection) {
            // Sell each card in the collection
            for (const card of data.collection) {
                if (card.pull_amount > 0) {
                    const currentMoney = await getCurrentMoney();
                    const totalCardValue = parseFloat(card.card_value) * card.pull_amount;
                    const newMoney = parseFloat(currentMoney) + totalCardValue;

                    // Set pull_amount to 0 (selling all copies)
                    const updated = await updateCardPullAmount(card.name, 0);

                    if (updated) {
                        await updateMoney(newMoney);
                    }
                }
            }

            // Update the collection and money display
            fetchCollection();
            updateMoneyDisplay();
            alert('All cards sold!');
        } else {
            alert('No cards found to sell.');
        }
    } catch (error) {
        console.error('Error selling all cards:', error);
        alert('An error occurred while selling all cards.');
    }
}

// Attach the event listener to the "Sell All" button
document.getElementById('sellAll').addEventListener('click', sellAllCards);

// Fetch card details from the database (backend)
async function getCardByName(cardName) {
    const response = await fetch(`http://localhost:3000/cards/${cardName}`)
    if (response.ok) {
        const card = await response.json();
        return card;
    } else {
        console.error("Failed to fetch card details.");
        return null;
    }
}

// Update the card pull_amount in the database (backend)
async function updateCardPullAmount(cardName, newPullAmount) {
    const response = await fetch(`http://localhost:3000/card-sell/${cardName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cardName: cardName,
            newPullAmount: newPullAmount
        })
    });
    if (response.ok) {
        const data = await response.json();
        return data.success;  // Assuming the API returns a success flag
    } else {
        console.error("Failed to update card pull_amount.");
        return false;
    }
}

function updateMoney(amount) {
    const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (state) {
        state.money = amount.toFixed(2);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
}

// Update the displayed money on the page
function updateMoneyDisplay() {
    const moneyAmountElement = document.getElementById('moneyAmount');
    if (moneyAmountElement) {
        const money = getCurrentMoney();  // Get the latest money value from localStorage
        console.log("Money updated to: $" + money);  // Debugging: Log updated money
        moneyAmountElement.textContent = `$${money}`; // Update the money display with the current money
    }
}

function updateMoneyDisplay() {
    const moneyAmountElement = document.querySelector('.moneyAmount');  // Select the first element with class 'moneyAmount'
    if (moneyAmountElement) {
        const money = getCurrentMoney();  // Get the latest money value from localStorage
        moneyAmountElement.textContent = `${money}`;  // Update the money display with the current money
    }
}
// Event listener for the "Show All Cards" button
document.getElementById('toggleView').addEventListener('click', () => {
    // Toggle the state
    showAllCards = !showAllCards;

    // Update the button text based on the current view
    const buttonText = showAllCards ? 'Show Collected Cards' : 'Show All Cards';
    document.getElementById('toggleView').textContent = buttonText;

    // Refetch and display the collection with the new filter
    fetchCollection();
});

// Fetch the collection when the page loads
fetchCollection();

document.addEventListener('DOMContentLoaded', () => {
    initializeState(); // Ensure state is initialized
    updateMoneyDisplay(); // Show the current money when the page loads
  });
