export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, company, jobTitle, linkedinUrl } = req.body;

  console.log("ENRICH REQUEST:", { name, company, jobTitle });

  // TRY APOLLO FIRST
  try {
    const apolloRes = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: { 
            "Content-Type": "application/json", 
            "Cache-Control": "no-cache",
            "X-Api-Key": process.env.APOLLO_API_KEY
        },
      body: JSON.stringify({
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" "),
        organization_name: company,
        title: jobTitle || "",
        linkedin_url: linkedinUrl || undefined,
        reveal_personal_emails: true,
      }),
    });
    const apolloData = await apolloRes.json();
    console.log("APOLLO STATUS:", apolloRes.status);
    console.log("APOLLO RESPONSE:", JSON.stringify(apolloData).slice(0, 500));

    const person = apolloData?.person;
    if (person && (person.email || person.linkedin_url)) {
      return res.json({
        source: "apollo",
        email: person.email || "",
        linkedinUrl: person.linkedin_url || linkedinUrl || "",
        phone: person.phone_numbers?.[0]?.sanitized_number || "",
        title: person.title || jobTitle || "",
        company: person.organization?.name || company,
      });
    }
  } catch (err) { console.error("Apollo error:", err.message); }

  // FALLBACK TO LUSHA
  try {
   const lushaRes = await fetch(
  `https://api.lusha.com/v2/person?firstName=${encodeURIComponent(name.split(" ")[0])}&lastName=${encodeURIComponent(name.split(" ").slice(1).join(" "))}&company=${encodeURIComponent(company)}`,
  { method: "GET", headers: { "api_key": process.env.LUSHA_API_KEY } }
);
    const lushaData = await lushaRes.json();
    console.log("LUSHA STATUS:", lushaRes.status);
    console.log("LUSHA RESPONSE:", JSON.stringify(lushaData).slice(0, 500));

    if (lushaData && (lushaData.emailAddresses?.length || lushaData.phoneNumbers?.length)) {
      return res.json({
        source: "lusha",
        email: lushaData.emailAddresses?.[0]?.emailAddress || "",
        linkedinUrl: linkedinUrl || "",
        phone: lushaData.phoneNumbers?.[0]?.localNumber || "",
        title: lushaData.title || jobTitle || "",
        company: lushaData.company || company,
      });
    }
  } catch (err) { console.error("Lusha error:", err.message); }

  // Return partial success even if no email found
  return res.status(404).json({ 
    error: "No data found from Apollo or Lusha",
    debug: {
      apollo_key_set: !!process.env.APOLLO_API_KEY,
      lusha_key_set: !!process.env.LUSHA_API_KEY,
    }
  });
}
