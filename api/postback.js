import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // CPAGrip sends data like ?user=YOUR_USER_ID&points=50
  const { user, points } = req.query;

  if (!user || !points) {
    return res.status(400).send("No data received: Missing user or points");
  }

  // This calls the SQL function you created in Supabase earlier
  const { error } = await supabase.rpc('increment_balance', { 
    user_id: user, 
    amount: parseInt(points) 
  });

  if (error) {
    console.error('Supabase Error:', error);
    return res.status(500).json({ error: error.message });
  }

  // Returning "1" is a CPAGrip requirement to confirm success
  return res.status(200).send("1");
}
