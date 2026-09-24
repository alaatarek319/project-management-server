import { pool } from '../db/index.js';
async function clearDatabase() {
    console.log('🗑️  Clearing all tables in Supabase...');
    const client = await pool.connect();
    try {
        // In PostgreSQL, TRUNCATE with CASCADE empties all tables and resets sequences cleanly
        await client.query(`
      TRUNCATE TABLE 
        production,
        state_log,
        assignment,
        device,
        machine,
        state_option,
        refresh_token,
        "user",
        shift,
        section
      RESTART IDENTITY
      CASCADE;
    `);
        console.log('✅ All tables have been completely emptied!');
    }
    catch (err) {
        console.error('❌ Failed to empty tables:', err);
        process.exit(1);
    }
    finally {
        client.release();
        process.exit(0);
    }
}
clearDatabase();
