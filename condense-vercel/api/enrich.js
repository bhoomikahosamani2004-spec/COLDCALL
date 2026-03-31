export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, company, jobTitle, linkedinUrl } = req.body;
  console.log("ENRICH REQUEST:", { name, company, jobTitle });

  const isNameReal = name && name.length > 3 && !name.includes(" Data") && !name.includes(" Platform") && !name.includes("Chief") && !name.includes("Director") && !name.includes("Head") && !name.includes("VP");

  // ── STRATEGY 1: Named person lookup (V2 prospects with real names) ──
  if (isNameReal && linkedinUrl) {
    try {
      const apolloRes = await fetch("https://api.apollo.io/v1/people/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": process.env.APOLLO_API_KEY,
        },
        body: JSON.stringify({
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" "),
          organization_name: company,
          linkedin_url: linkedinUrl,
          reveal_personal_emails: true,
        }),
      });
      const apolloData = await apolloRes.json();
      const person = apolloData?.person;
      if (person && (person.email || person.linkedin_url)) {
        return res.json({
          source: "apollo",
          name: `${person.first_name || ""} ${person.last_name || ""}`.trim(),
          email: person.email || "",
          linkedinUrl: person.linkedin_url || linkedinUrl || "",
          phone: person.phone_numbers?.[0]?.sanitized_number || "",
          title: person.title || jobTitle || "",
          company: person.organization?.name || company,
        });
      }
    } catch (err) { console.error("Apollo named lookup error:", err.message); }
  }

  // ── STRATEGY 2: Title-based search (GTM Excel rows with no name) ──
  try {
    const searchRes = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.APOLLO_API_KEY,
      },
      body: JSON.stringify({
        organization_names: [company],
        titles: [jobTitle],
        per_page: 1,
        page: 1,
      }),
    });
    const searchData = await searchRes.json();
    console.log("APOLLO SEARCH STATUS:", searchRes.status);
    console.log("APOLLO SEARCH RESPONSE:", JSON.stringify(searchData).slice(0, 500));

    const person = searchData?.people?.[0];
    if (person) {
      // Now do a match to get email revealed
      let email = person.email || "";
      if (!email && person.id) {
        try {
          const matchRes = await fetch("https://api.apollo.io/v1/people/match", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": process.env.APOLLO_API_KEY,
            },
            body: JSON.stringify({
              id: person.id,
              reveal_personal_emails: true,
            }),
          });
          const matchData = await matchRes.json();
          email = matchData?.person?.email || "";
        } catch (err) { console.error("Apollo reveal error:", err.message); }
      }

      return res.json({
        source: "apollo",
        name: `${person.first_name || ""} ${person.last_name || ""}`.trim(),
        email: email,
        linkedinUrl: person.linkedin_url || "",
        phone: person.phone_numbers?.[0]?.sanitized_number || "",
        title: person.title || jobTitle || "",
        company: person.organization_name || company,
      });
    }
  } catch (err) { console.error("Apollo search error:", err.message); }

  // ── STRATEGY 3: Lusha fallback (title-based) ──
  try {
    const lushaRes = await fetch(
      `https://api.lusha.com/v2/company/employees?company=${encodeURIComponent(company)}&title=${encodeURIComponent(jobTitle)}&limit=1`,
      { method: "GET", headers: { "api_key": process.env.LUSHA_API_KEY } }
    );
    const lushaData = await lushaRes.json();
    console.log("LUSHA STATUS:", lushaRes.status);
    console.log("LUSHA RESPONSE:", JSON.stringify(lushaData).slice(0, 500));

    const person = lushaData?.data?.[0];
    if (person) {
      return res.json({
        source: "lusha",
        name: `${person.firstName || ""} ${person.lastName || ""}`.trim(),
        email: person.emailAddresses?.[0]?.emailAddress || "",
        linkedinUrl: person.linkedinUrl || "",
        phone: person.phoneNumbers?.[0]?.localNumber || "",
        title: person.title || jobTitle || "",
        company: company,
      });
    }
  } catch (err) { console.error("Lusha error:", err.message); }

  return res.status(404).json({
    error: "No data found from Apollo or Lusha",
    debug: {
      apollo_key_s
