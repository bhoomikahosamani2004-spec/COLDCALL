export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, company, jobTitle, linkedinUrl } = req.body;
  if (!company) return res.status(400).json({ found: false, error: "Company is required" });

  const cleanName = (name || "").trim();
  const firstName = cleanName.split(" ")[0];
  const lastName = cleanName.split(" ").slice(1).join(" ");
  console.log("ENRICH REQUEST:", { name: cleanName, company, jobTitle });

  // APOLLO
  try {
    const apolloRes = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache", "X-Api-Key": process.env.APOLLO_API_KEY },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        organization_name: company,
        title: jobTitle || "",
        linkedin_url: linkedinUrl || undefined,
        reveal_personal_emails: true,
      }),
    });
    const apolloData = await apolloRes.json();
    const person = apolloData?.person;
    if (person && (person.email || person.linkedin_url)) {
      return res.json({
        found: true,
        source: "Apollo",
        name: `${person.first_name || ""} ${person.last_name || ""}`.trim(),
        email: person.email || "",
        linkedinUrl: person.linkedin_url || linkedinUrl || "",
        phone: person.phone_numbers?.[0]?.sanitized_number || "",
        title: person.title || jobTitle || "",
        company: person.organization?.name || company,
      });
    }
  } catch (err) { console.error("Apollo error:", err.message); }

  // LUSHA
  try {
    const lushaRes = await fetch(
      `https://api.lusha.com/v2/person?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&company=${encodeURIComponent(company)}`,
      { method: "GET", headers: { "api_key": process.env.LUSHA_API_KEY } }
    );
    const lushaData = await lushaRes.json();
    if (lushaData && (lushaData.emailAddresses?.length || lushaData.phoneNumbers?.length)) {
      return res.json({
        found: true,
        source: "Lusha",
        name: lushaData.fullName || `${lushaData.firstName || ""} ${lushaData.lastName || ""}`.trim(),
        email: lushaData.emailAddresses?.[0]?.emailAddress || "",
        linkedinUrl: linkedinUrl || "",
        phone: lushaData.phoneNumbers?.[0]?.localNumber || "",
        title: lushaData.title || jobTitle || "",
        company: lushaData.company || company,
      });
    }
  } catch (err) { console.error("Lusha error:", err.message); }

  return res.status(404).json({
    found: false,
    error: "No data found",
    debug: { apollo_key_set: !!process.env.APOLLO_API_KEY, lusha_key_set: !!process.env.LUSHA_API_KEY }
  });
}
