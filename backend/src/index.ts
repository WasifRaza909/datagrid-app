import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Get all table names
app.get('/api/tables', async (req, res) => {
  try {
    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('get_table_names');

    if (error) {
      console.error("Supabase RPC error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Return data as-is (it's already in the right format from the RPC)
    res.json({ tables: data || [] });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Failed to fetch table names' });
  }
});

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    const { count, error } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Supabase error:", error);
    } else {
      console.log("✅ Supabase connected! Row count:", count);
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  testSupabaseConnection();
});
