import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
  if (pool === null) {
    // During build time, return a dummy pool
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return {
        query: async () => ({ rows: [] }),
        connect: async () => ({
          query: async () => ({ rows: [] }),
          release: () => {},
        }),
      };
    }

    console.log('Creating new database pool');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL:', process.env.DATABASE_URL);

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: false
    });

    // Add error handler to the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}

// Export database interface
export default {
  async query(text: string, params?: any[]) {
    const pool = getPool();
    try {
      console.log('Executing query:', text);
      if (params) console.log('Query params:', params);
      const result = await pool.query(text, params);
      console.log('Query result rows:', result.rows.length);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async connect() {
    const pool = getPool();
    try {
      console.log('Getting client from pool');
      const client = await pool.connect();
      const release = client.release;
      client.release = () => {
        console.log('Releasing client back to pool');
        release.apply(client);
      };
      return client;
    } catch (error) {
      console.error('Error getting client from pool:', error);
      throw error;
    }
  }
};
