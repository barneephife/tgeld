const { Pool } = require('pg');

async function initializeData() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db',
    database: process.env.DB_DATABASE || 'tgeld',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    // Check if settings already exist
    const settingsCheck = await pool.query('SELECT COUNT(*) FROM app_settings');
    
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      console.log('Initializing default settings...');
      
      // Insert default settings
      await pool.query(`
        INSERT INTO app_settings (setting_key, setting_value) VALUES
        ('enforce_roles', 'true'),
        ('currency', 'EUR'),
        ('language', 'de'),
        ('theme', 'light'),
        ('notifications_enabled', 'true')
      `);
      
      console.log('Default settings initialized successfully');
    } else {
      console.log('Settings already exist, skipping initialization');
    }

    return true;
  } catch (error) {
    console.error('Error initializing data:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeData()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Initialization script failed:', error);
    process.exit(1);
  });
