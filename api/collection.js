const LOCAL_STORAGE_KEY = 'tcgState';

function initializeState() {
    let state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (!state) {
        state = {
            money: 10, 
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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
    return state;
}

function getCurrentMoney() {
    const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    return state ? state.money : 100; 
}

async function fetchCollection() {
    try {
        // Fetch collection from Supabase
        const { data, error } = await supabase
            .from('pokemontcg')
            .select('*');

        if (error) {
            console.error('Error fetching collection:', error.message);
        } else {
            displayCollection(data);
        }
    } catch (error) {
        console.error('Error fetching collection:', error);
    }
}

let showAllCards = false;

function displayCollection(cards) {
    const collectionDiv = document.getElementById('collection');
    collectionDiv.innerHTML = ''; 

    let filteredCards = cards;

    if (!showAllCards) {
        filteredCards = cards.filter(card => card.pull_amount > 0);
    }

    const collectedCardsCount = cards.filter(card => card.pull_amount > 0).length;
    const collectedCountElement = document.getElementById('collectedCount');
    if (collectedCountElement) {
        collectedCountElement.textContent = `Collected Cards: ${collectedCardsCount} /1025`;
    }

    filteredCards.forEach(card => {
        const cardItem = document.createElement('div');
        cardItem.classList.add('card-item');

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
    const currentMoney = await getCurrentMoney();

    const card = await getCardByName(cardName);

    if (card && card.pull_amount > 0) {
        const newMoney = parseFloat(currentMoney) + parseFloat(cardValue);

        const updated = await updateCardPullAmount(cardName, card.pull_amount - 1);

        if (updated) {
            await updateMoney(newMoney);
            console.log("New Money after selling: $" + newMoney);
            fetchCollection();
            updateMoneyDisplay();
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
        const { data, error } = await supabase
            .from('pokemontcg')
            .select('*');

        if (error) {
            console.error("Error fetching collection:", error.message);
        } else {
            const duplicates = data.filter(card => card.pull_amount > 1);

            for (const card of duplicates) {
                const currentMoney = await getCurrentMoney();
                const newMoney = parseFloat(currentMoney) + parseFloat(card.card_value) * (card.pull_amount - 1);

                const updated = await updateCardPullAmount(card.name, 1);

                if (updated) {
                    await updateMoney(newMoney);
                }
            }

            fetchCollection();
            updateMoneyDisplay();
            alert('Duplicates sold!');
        }
    } catch (error) {
        console.error('Error selling duplicates:', error);
        alert('An error occurred while selling duplicates.');
    }
}

// Function to sell all cards (including all copies)
async function sellAllCards() {
    try {
        const { data, error } = await supabase
            .from('pokemontcg')
            .select('*');

        if (error) {
            console.error("Error fetching collection:", error.message);
        } else {
            for (const card of data) {
                if (card.pull_amount > 0) {
                    const currentMoney = await getCurrentMoney();
                    const totalCardValue = parseFloat(card.card_value) * card.pull_amount;
                    const newMoney = parseFloat(currentMoney) + totalCardValue;

                    const updated = await updateCardPullAmount(card.name, 0);

                    if (updated) {
                        await updateMoney(newMoney);
                    }
                }
            }

            fetchCollection();
            updateMoneyDisplay();
            alert('All cards sold!');
        }
    } catch (error) {
        console.error('Error selling all cards:', error);
        alert('An error occurred while selling all cards.');
    }
}

// Fetch card details from Supabase
async function getCardByName(cardName) {
    const { data, error } = await supabase
        .from('pokemontcg')
        .select('*')
        .eq('card_name', cardName)
        .single();

    if (error) {
        console.error("Failed to fetch card details:", error.message);
        return null;
    }
    return data;
}

// Update the card pull_amount in Supabase
async function updateCardPullAmount(cardName, newPullAmount) {
    const { data, error } = await supabase
        .from('pokemontcg')
        .update({ pull_amount: newPullAmount })
        .eq('card_name', cardName);

    if (error) {
        console.error("Failed to update card pull_amount:", error.message);
        return false;
    }
    return true;
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
    const moneyAmountElement = document.querySelector('.moneyAmount');  
    if (moneyAmountElement) {
        const money = getCurrentMoney();  
        moneyAmountElement.textContent = `$${money}`;
    }
}

// Event listener for the "Show All Cards" button
document.getElementById('toggleView').addEventListener('click', () => {
    showAllCards = !showAllCards;
    const buttonText = showAllCards ? 'Show Collected Cards' : 'Show All Cards';
    document.getElementById('toggleView').textContent = buttonText;
    fetchCollection();
});

document.addEventListener('DOMContentLoaded', () => {
    initializeState();
    updateMoneyDisplay();
    fetchCollection();
});
