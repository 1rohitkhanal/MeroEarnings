import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase (Make sure these are in your Vercel Environment Variables)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use Service Role to bypass RLS
);

export default async function handler(req, res) {
  // MyLead/CPAGrip sends data via GET request
  const { user, points } = req.query;

  if (!user || !points) {
    console.error("Postback failed: Missing user or points");
    return res.status(400).send("0");
  }

  let amountToAdd = parseFloat(points);

  // 2. SMART MATH: 
  // If you use [payout], 0.43 becomes 43 coins.
  // If you use [tokens], 100 stays 100 coins.
  if (amountToAdd < 5) {
    amountToAdd = amountToAdd * 100;
  }

  // 3. DATABASE UPDATE
  // We use Math.round to avoid decimals like 42.9999
  const { error } = await supabase.rpc('increment_balance', { 
    user_id: user, 
    amount: Math.round(amountToAdd) 
  });

  if (error) {
    console.error("Database Error:", error.message);
    return res.status(500).send("0");
  }

  // Success signal for MyLead/CPAGrip
  return res.status(200).send("1");
}
