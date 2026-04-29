import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { user, points, secret } = req.query;

  // 2. Security Check (using env variable - not hardcoded)
  if (secret !== process.env.POSTBACK_SECRET) {
    console.error("Unauthorized postback attempt blocked.");
    return res.status(403).send("0");
  }

  // 3. Validation
  if (!user || !points) {
    console.error("Postback failed: Missing user or points");
    return res.status(400).send("0");
  }

  // 4. Clean conversion — 1 dollar = 100 coins, always
  const coinsToAdd = Math.round(parseFloat(points) * 100);

  if (coinsToAdd <= 0) {
    console.error("Postback failed: Invalid points value");
    return res.status(400).send("0");
  }

  // 5. Database update via RPC
  const { error } = await supabase.rpc('increment_balance', {
    user_id: user,
    amount: coinsToAdd
  });

  if (error) {
    console.error("Database Error:", error.message);
    return res.status(500).send("0");
  }

  console.log(`✅ Credited ${coinsToAdd} coins to user ${user}`);
  return res.status(200).send("1");
}
