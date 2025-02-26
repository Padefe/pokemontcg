import dotenv from 'dotenv';
import pkg from 'pg'; // Default import

const { Client } = pkg; // Destructure the Client from the imported package


dotenv.config();

//import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';
//import sql from './db.js';



// Initialize Supabase client
/*const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
*/

//const connectionString = process.env.DATABASE_URL
//const sql = pkg(connectionString)

//export default sql

const app = express();

//app.use(express.json());
//app.use(cors({ origin: '*' }));

// Root route
//app.get('/', (req, res) => {
//    res.send('Welcome to the Pokémon TCG API!');
//});

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
  
  client.connect()
  .then(() => {
    console.log('Connected to Supabase!');
  })
  .catch(err => {
    console.error('Connection error:', err);
  });

// Function to create a region booster pack
async function createRegionBoosterPack(region) {
    try {
        const commonCards = await getCardsByRegionAndRarity(region, 'common', 4);
        console.log(region);
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
        const boosterPack = await createAllRegionsBoosterPack();
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

// Update pull_amount in the database
async function incrementPullAmount(dex_number) {
    try {
        const { data, error } = await supabase
            .from('pokemontcg')
            .update({ pull_amount: supabase.raw('pull_amount + 1') })
            .eq('dex_number', dex_number);

        if (error) {
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Error updating pull amount:', err);
        throw err;
    }
}

// Route to get card details by name
app.get('/cards/:cardName', async (req, res) => {
    const cardName = req.params.cardName;
    try {
        const { data, error } = await supabase
            .from('pokemontcg')
            .select('*')
            .eq('name', cardName);

        if (error) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (data.length > 0) {
            res.json(data[0]);
        } else {
            res.status(404).json({ error: 'Card not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error fetching card' });
    }
});

// Route to sell a card (update pull_amount)
app.post('/card-sell/:cardName', async (req, res) => {
    const { cardName, newPullAmount } = req.body;
    if (typeof newPullAmount !== 'number') {
        return res.status(400).json({ error: 'Invalid pull_amount value' });
    }

    try {
        const { data, error } = await supabase
            .from('pokemontcg')
            .update({ pull_amount: newPullAmount })
            .eq('name', cardName);

        if (error) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (data.length > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Card not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error selling card' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
