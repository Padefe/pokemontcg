
// Event listener for the "View Collection" button
document.getElementById("viewCollection").addEventListener("click", getCollection);

document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');

        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = tab.id === tabName ? 'block' : 'none';
        });
    });
});

// Eksempelvis oppdatering av penger og booster pack-antall
document.getElementById('money').textContent = '0';
// Du kan legge til funksjoner for å oppdatere booster pack-telleren og kortlisten senere.
// Function to fetch the booster pack
async function getBoosterPack(region) {
    let url = `http://localhost:3000/booster-pack`;  // Use the correct backend URL for all regions
    if (region) {
        url = `http://localhost:3000/booster-pack/${region}`;  // Use the correct backend URL for specific regions
    }
    else {
        url = 'http://localhost:3000/booster-pack/all';
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        const boosterPackValueContainer = document.getElementById('boosterPackValue');
        boosterPackValueContainer.innerHTML = `Booster Pack Value: $${data.boosterPackValue}`;


        // Clear any previous booster pack cards
        const boosterPackContainer = document.getElementById("boosterPack");
        boosterPackContainer.innerHTML = '';

        // Check if we got cards back
        if (data.success && data.boosterPack && data.boosterPack.length > 0) {
            data.boosterPack.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.innerHTML = `
                    <img src="${card.image_url}" alt="${card.name}">
                    <div class="card-name">${card.name}</div>
                    <div class="rarity">${card.rarity}</div>
                `;
                boosterPackContainer.appendChild(cardElement);
            });
        } else {
            boosterPackContainer.innerHTML = '<p>No cards found for this booster pack.</p>';
        }
    } catch (error) {
        console.error("Error fetching booster pack:", error);
    }
}

// Event listeners for buttons
document.getElementById("regionAll").addEventListener("click", () => getBoosterPack());
document.getElementById("regionKanto").addEventListener("click", () => getBoosterPack("Kanto"));
document.getElementById("regionJohto").addEventListener("click", () => getBoosterPack("Johto"));
document.getElementById("regionHoenn").addEventListener("click", () => getBoosterPack("Hoenn"));
document.getElementById("regionSinnoh").addEventListener("click", () => getBoosterPack("sinnoh"));
document.getElementById("regionUnova").addEventListener("click", () => getBoosterPack("Unova"));
document.getElementById("regionKalos").addEventListener("click", () => getBoosterPack("Kalos"));
document.getElementById("regionAlola").addEventListener("click", () => getBoosterPack("Alola"));
document.getElementById("regionGalar").addEventListener("click", () => getBoosterPack("Galar"));
document.getElementById("regionPaldea").addEventListener("click", () => getBoosterPack("Paldea"));

async function getCollection() {
    try {
        // Make sure to include 'http://' or 'https://' in the URL
        const response = await fetch('http://localhost:3000/collection');
        const data = await response.json();

        // Clear any previous cards displayed
        const collectionContainer = document.getElementById('collectionContainer');
        collectionContainer.innerHTML = '';

        // Check if there are any cards
        if (data.collection && data.collection.length > 0) {
            data.collection.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.innerHTML = `
                    <img src="${card.image_url}" alt="${card.name}">
                    <div class="card-name">${card.name}</div>
                    <div class="rarity">${card.rarity}</div>
                `;
                collectionContainer.appendChild(cardElement);
            });
        } else {
            collectionContainer.innerHTML = '<p>No cards in your collection yet!</p>';
        }
    } catch (error) {
        console.error("Error fetching collection:", error);
    }
}
