document.addEventListener("DOMContentLoaded", () => {
    // Get the buttons
    const goToStore = document.getElementById('goToStore');
    const goToCollection = document.getElementById('goToCollection');
    const goToPacks = document.getElementById('goToPacks');

    // Add event listeners for the buttons
    goToStore.addEventListener('click', () => {
        navigateTo('store');
    });

    goToCollection.addEventListener('click', () => {
        navigateTo('collection.html');
    });

    goToPacks.addEventListener('click', () => {
        navigateTo('packs.html');
    });

  
});
