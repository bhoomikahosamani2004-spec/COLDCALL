export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, company } = req.body;
  
  try {
    // 1. Try Apollo
    const apolloRes = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.APOLLO_API_KEY,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" "),
        organization_name: company,
        reveal_personal_emails: true
      }),
    });
    const apolloData = await apolloRes.json();
    
    if (apolloData.person?.email) {
      return res.status(200).json({
        source: "Apollo",
        email: apolloData.person.email,
        phone: apolloData.person.phone_numbers?.[0]?.sanitized_number || ""
      });
    }

    // 2. Fallback to Lusha if Apollo fails
    const lushaRes = await fetch(
      `https://api.lusha.com/person?firstName=${name.split(" ")[0]}&lastName=${name.split(" ").slice(1).join(" ")}&company=${company}`,
      { headers: { "api_key": process.env.LUSHA_API_KEY } }
    );
    const lushaData = await lushaRes.json();

    if (lushaData.emailAddresses?.[0]?.emailAddress) {
      return res.status(200).json({
        source: "Lusha",
        email: lushaData.emailAddresses[0].emailAddress,
        phone: lushaData.phoneNumbers?.[0]?.internationalNumber || ""
      });
    }

    return res.status(404).json({ error: "No data found" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
