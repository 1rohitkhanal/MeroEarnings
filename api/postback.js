import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // MyLead/CPAGrip sends data via GET request
  // Added 'secret' to the destructured query
  const { user, points, secret } = req.query;

  // 2. THE BOUNCER: Security Check
  // This prevents random people from hitting your API URL
  if (secret !== "RohitSecret2026!") {
    console.error("Unauthorized postback attempt blocked.");
    return res.status(403).send("0"); 
  }

  // 3. Validation
  if (!user || !points) {
    console.error("Postback failed: Missing user or points");
    return res.status(400).send("0");
  }

  let amountToAdd = parseFloat(points);

  // 4. SMART MATH logic
  if (amountToAdd < 5) {
    amountToAdd = amountToAdd * 100;
  }

  // 5. DATABASE UPDATE via Secure RPC
  const { error } = await supabase.rpc('increment_balance', { 
    user_id: user, 
    amount: Math.round(amountToAdd) 
  });

  if (error) {
    console.error("Database Error:", error.message);
    return res.status(500).send("0");
  }

  // Success signal
  return res.status(200).send("1");
}
