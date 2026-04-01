export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, company, jobTitle, linkedinUrl } = req.body;
  if (!company) return res.status(400).json({ found: false, error: "Company is required" });

  const cleanName = (name || "").trim();
  const firstName = cleanName.split(" ")[0];
  const lastName = cleanName.split(" ").slice(1).join(" ");
  console.log("ENRICH REQUEST:", { name: cleanName, company, jobTitle });

  // ── APOLLO ────────────────────────────────────────────────────────────────
  if (process.env.APOLLO_API_KEY) {
    try {
      const apolloRes = await fetch("https://api.apollo.io/v1/people/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": process.env.APOLLO_API_KEY,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          organization_name: company,
          title: jobTitle || "",
          linkedin_url: linkedinUrl || undefined,
          reveal_personal_emails: true,
        }),
      });

      // ✅ FIX 1: Only use Apollo if response is actually OK
      if (apolloRes.ok) {
        const apolloData = await apolloRes.json();
        const person = apolloData?.person;
        if (person && (person.email || person.linkedin_url)) {
          console.log("Apollo hit:", person.email);
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
      } else {
        // Log the actual Apollo error (credits, auth, etc.)
        const errText = await apolloRes.text();
        console.warn(`Apollo skipped — status ${apolloRes.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.error("Apollo fetch error:", err.message);
    }
  } else {
    console.warn("APOLLO_API_KEY not set — skipping Apollo");
  }

  // ── LUSHA ─────────────────────────────────────────────────────────────────
  if (process.env.LUSHA_API_KEY) {
    try {
      console.log("Trying Lusha for:", firstName, lastName, company);
    const lushaRes = await fetch(
  `https://api.lusha.com/v2/person?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&companyName=${encodeURIComponent(company)}`,
        {
          method: "GET",
          headers: {
            "api_key": process.env.LUSHA_API_KEY,
          },
        }
      );

      console.log("Lusha status:", lushaRes.status);
      const lushaData = await lushaRes.json();
      console.log("Lusha response:", JSON.stringify(lushaData).slice(0, 300));

      // ✅ FIX 2: Check array length properly
      const email = lushaData?.emailAddresses?.[0]?.emailAddress || "";
      const phone = lushaData?.phoneNumbers?.[0]?.localNumber || "";
      const lushaName = lushaData?.fullName
        || `${lushaData?.firstName || ""} ${lushaData?.lastName || ""}`.trim();

      if (email || phone || lushaName) {
        return res.json({
          found: true,
          source: "Lusha",
          name: lushaName,
          email,
          linkedinUrl: linkedinUrl || "",
          phone,
          title: lushaData?.title || jobTitle || "",
          company: lushaData?.company || company,
        });
      } else {
        console.warn("Lusha returned no usable data:", lushaData);
      }
    } catch (err) {
      console.error("Lusha fetch error:", err.message);
    }
  } else {
    console.warn("LUSHA_API_KEY not set — skipping Lusha");
  }

  return res.status(404).json({
    found: false,
    error: "No data found from Apollo or Lusha",
    debug: {
      apollo_key_set: !!process.env.APOLLO_API_KEY,
      lusha_key_set: !!process.env.LUSHA_API_KEY,
    },
  });
}
