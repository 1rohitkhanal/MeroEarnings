export default async function handler(req, res) {
  // Both networks will now send ?user=...&points=...
  const { user, points } = req.query;

  if (!user || !points) {
    return res.status(400).send("0"); // CPA networks like "0" for fail
  }

  // Convert points to a number. 
  // If 'points' is 0.60 (dollars), multiply by 100 to get 60 coins.
  let amountToAdd = parseFloat(points);
  
  if (amountToAdd < 5) { 
    // Logic: If the value is small (like 0.60), it's likely USD. Multiply it.
    amountToAdd = amountToAdd * 100;
  }

  const { error } = await supabase.rpc('increment_balance', { 
    user_id: user, 
    amount: Math.floor(amountToAdd) 
  });

  if (error) {
    return res.status(500).send("0");
  }

  // Return "1" so both CPAGrip and MyLead know it worked!
  return res.status(200).send("1");
}
