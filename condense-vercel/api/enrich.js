// api/enrich.js
export default async function handler(req, res) {
  const { name, company, jobTitle, linkedinUrl, source } = req.body;

  // If source is specified, only try that one source
  // If no source specified, try Apollo first then Lusha (same fallback)

  const tryApollo = async () => {
    // your existing Apollo API call
    const apolloRes = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.APOLLO_API_KEY,
      },
      body: JSON.stringify({
        name,
        organization_name: company,
        title: jobTitle,
        linkedin_url: linkedinUrl,
        reveal_personal_emails: true,
      }),
    });
    const data = await apolloRes.json();
    const person = data.person;
    if (!person) throw new Error("Apollo: no person found");
    return {
      name: person.name || "",
      email: person.email || person.personal_emails?.[0] || "",
      phone: person.phone_numbers?.[0]?.sanitized_number || "",
      linkedinUrl: person.linkedin_url || "",
      title: person.title || "",
      source: "apollo",
    };
  };

  const tryLusha = async () => {
    // your existing Lusha API call
    const lushaRes = await fetch("https://api.lusha.com/v2/person", {
      method: "GET",
      headers: {
        "api_key": process.env.LUSHA_API_KEY,
      },
      // Lusha uses query params
    });
    // adapt to your existing Lusha implementation
    const data = await lushaRes.json();
    if (!data || data.error) throw new Error("Lusha: no person found");
    return {
      name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      email: data.emails?.[0]?.email || "",
      phone: data.phoneNumbers?.[0]?.normalizedNumber || "",
      linkedinUrl: linkedinUrl || "",
      title: jobTitle || "",
      source: "lusha",
    };
  };

  try {
    if (source === "apollo") {
      // Only Apollo, don't fallback
      const result = await tryApollo();
      return res.json(result);
    }

    if (source === "lusha") {
      // Only Lusha, don't fallback
      const result = await tryLusha();
      return res.json(result);
    }

    // No source specified — try Apollo first, then Lusha
    try {
      const result = await tryApollo();
      return res.json(result);
    } catch {
      const result = await tryLusha();
      return res.json(result);
    }

  } catch (err) {
    return res.json({ error: err.message });
  }
}
