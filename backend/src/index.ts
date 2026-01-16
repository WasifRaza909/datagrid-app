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

app.get('/api/tables/:name', async (req, res) => {
  const tableName = req.params.name;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 500;
  const offset = (page - 1) * limit;

  // Basic validation to avoid invalid identifiers
  if (!tableName) {
    return res.status(400).json({ error: 'Table is not defined' });
  }

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Supabase count error:", countError);
      return res.status(500).json({ error: countError.message });
    }

    // Get paginated data
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ 
      table: tableName, 
      rows: data || [], 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
