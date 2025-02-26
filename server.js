import { createClient } from '@supabase/supabase-js';

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');



const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'Padefe',  // Replace with your MySQL username
    password: 'Dracco55',  // Replace with your MySQL password
    database: 'pokemon_tcg'
});

const app = express();
const port = 3000;

app.use(express.json());

// Enable CORS for all routes
app.use(cors({ origin: '*' }));

// Function to get random cards based on region and rarity
function getCardsByRegionAndRarity(region, rarity, limit) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM cards WHERE region LIKE ? AND rarity = ? ORDER BY RAND() LIMIT ?';
        db.query(query, [region, rarity, limit], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

}

// Function to create a booster pack for a specific region
async function createRegionBoosterPack(region) {
    try {
        const commonCards = await getCardsByRegionAndRarity(region, 'common', 4);
        const rareCard = await getCardsByRegionAndRarity(region, 'rare', 1);
        const boosterPack = [...commonCards, ...rareCard];
        for (const card of boosterPack) {
            await incrementPullAmount(card.dex_number);
        }
        return boosterPack;
    } catch (err) {
        console.error('Error creating region booster pack:', err);
    }
}

// Function to create an all-regions booster pack
async function createAllRegionsBoosterPack() {
    try {
        const commonCards = await getCardsByRegionAndRarity('%', 'common', 8);
        const rareCards = await getCardsByRegionAndRarity('%', 'rare', 2);
        const randomRarity = Math.random() > 0.5 ? 'common' : 'rare';
        const randomCard = await getCardsByRegionAndRarity('%', randomRarity, 1);
        const boosterPack = [...commonCards, ...rareCards, ...randomCard];
        for (const card of boosterPack) {
            await incrementPullAmount(card.dex_number);
        }
        return boosterPack;
    } catch (err) {
        console.error('Error creating all-regions booster pack:', err);
    }
}


// Route to generate a booster pack for all regions
app.get('/booster-pack/all', async (req, res) => {
    try {
        const boosterPack = await createAllRegionsBoosterPack();  // This calls the correct function
        res.json({
            success: true,
            boosterPack: boosterPack,
        });
    } catch (error) {
        console.error('Error generating all-regions booster pack:', error);
        res.json({ success: false, message: 'Error generating all-regions booster pack' });
    }
});

// Route to generate a booster pack for a specific region
app.get('/booster-pack/:region', async (req, res) => {
    const { region } = req.params;
    try {
        const boosterPack = await createRegionBoosterPack(region);
        res.json({
            success: true,
            region: region,
            boosterPack: boosterPack,
        });
    } catch (error) {
        console.error('Error generating booster pack for region:', error);
        res.json({ success: false, message: 'Error generating booster pack' });
    }
});

// Function to update pull_amount in the database
async function incrementPullAmount(pull_amount) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE cards SET pull_amount = pull_amount + 1 WHERE dex_number = ?';
        db.query(query, [pull_amount], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// Route to get the user's collection
app.get('/collection', async (req, res) => {
    try {
        const query = 'SELECT * FROM cards';
        db.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching collection:', err);
                res.json({ success: false, message: 'Error fetching collection' });
            } else {
                res.json({
                    success: true,
                    collection: result
                });
            }
        });
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.json({ success: false, message: 'Error fetching collection' });
    }
});

// Route to get card details by name
app.get('/cards/:cardName', (req, res) => {
    const cardName = req.params.cardName;
    // Query to get card details
    const query = 'SELECT * FROM cards WHERE name = ?';
    db.query(query, [cardName], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (results.length > 0) {
            res.json(results[0]);  // Send the first matching card
        } else {
            res.status(404).json({ error: 'Card not found' });
        }
    });
});

// Route to get card details by name
app.post('/card-sell/:cardName', (req, res) => {
    const { cardName, newPullAmount } = req.body;
    if (typeof newPullAmount !== 'number') {
        return res.status(400).json({ error: 'Invalid pull_amount value' });
    }

    // Query to get card details
    const query = 'UPDATE cards SET pull_amount = ? WHERE name = ?';
    db.query(query, [newPullAmount, cardName], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (results.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Card not found' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
