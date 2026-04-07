// /api/enrich.js
// Returns email + linkedinUrl from Apollo → Lusha fallback
// Phone is NOT fetched here — use /api/enrich-phone for that

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, company, jobTitle, linkedinUrl } = req.body;
  if (!company) return res.status(400).json({ found: false, error: "Company is required" });

  const cleanName = (name || "").trim();
  const firstName = cleanName.split(" ")[0];
  const lastName = cleanName.split(" ").slice(1).join(" ");
  console.log("ENRICH REQUEST:", { name: cleanName, company, jobTitle });

  // Accumulate results across providers so we can merge best data
  let result = {
    found: false,
    source: null,
    name: cleanName,
    email: "",
    linkedinUrl: linkedinUrl || "",
    title: jobTitle || "",
    company,
    phone: "", // intentionally empty — use /api/enrich-phone for this
  };

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
          // NOTE: reveal_phone_number is NOT included here — costs extra credits
        }),
      });

      if (apolloRes.ok) {
        const apolloData = await apolloRes.json();
        const person = apolloData?.person;
        if (person) {
          const apolloEmail = person.email || "";
          const apolloLinkedin = person.linkedin_url || "";
          const apolloName = `${person.first_name || ""} ${person.last_name || ""}`.trim();

          if (apolloEmail || apolloLinkedin || apolloName) {
            result.found = true;
            result.source = "Apollo";
            result.name = apolloName || result.name;
            result.email = apolloEmail;
            result.linkedinUrl = apolloLinkedin || result.linkedinUrl;
            result.title = person.title || result.title;
            result.company = person.organization?.name || result.company;
            console.log("Apollo hit — email:", apolloEmail, "linkedin:", apolloLinkedin);
          }
        }
      } else {
        const errText = await apolloRes.text();
        console.warn(`Apollo skipped — status ${apolloRes.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.error("Apollo fetch error:", err.message);
    }
  } else {
    console.warn("APOLLO_API_KEY not set — skipping Apollo");
  }

  // ── LUSHA — only call if Apollo missed email OR linkedin ───────────────────
  const needsLusha = !result.email || !result.linkedinUrl;

  if (needsLusha && process.env.LUSHA_API_KEY) {
    try {
      console.log("Trying Lusha for:", firstName, lastName, company);

      const lushaRes = await fetch(
        `https://api.lusha.com/v2/person?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&companyName=${encodeURIComponent(company)}&revealEmails=true`,
        {
          method: "GET",
          headers: {
            "api_key": process.env.LUSHA_API_KEY,
          },
        }
      );

      console.log("Lusha status:", lushaRes.status);

      if (lushaRes.ok) {
        const lushaData = await lushaRes.json();
        console.log("Lusha response:", JSON.stringify(lushaData).slice(0, 300));

        const d = lushaData?.contact?.data || lushaData;
        const lushaEmail = d?.emailAddresses?.[0]?.email || d?.emailAddresses?.[0]?.emailAddress || "";
        const lushaLinkedin = d?.socialLinks?.linkedIn || d?.linkedInUrl || "";
        const lushaName = d?.fullName || `${d?.firstName || ""} ${d?.lastName || ""}`.trim();

        if (lushaEmail || lushaLinkedin || lushaName) {
          // Merge: fill in gaps from Lusha, don't overwrite Apollo hits
          result.found = true;
          result.source = result.source ? `${result.source}+Lusha` : "Lusha";
          result.name = result.name || lushaName;
          result.email = result.email || lushaEmail;         // fill only if Apollo missed
          result.linkedinUrl = result.linkedinUrl || lushaLinkedin; // fill only if Apollo missed
          result.title = result.title || d?.jobTitle?.title || d?.title || "";
          result.company = result.company || d?.company?.name || d?.company || company;
          console.log("Lusha hit — email:", lushaEmail, "linkedin:", lushaLinkedin);
        } else {
          console.warn("Lusha returned no usable data:", lushaData);
        }
      } else {
        const errText = await lushaRes.text();
        console.warn(`Lusha skipped — status ${lushaRes.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.error("Lusha fetch error:", err.message);
    }
  } else if (!process.env.LUSHA_API_KEY) {
    console.warn("LUSHA_API_KEY not set — skipping Lusha");
  }

  if (result.found) {
    return res.json(result);
  }

  return res.status(404).json({
    found: false,
    error: "No data found from Apollo or Lusha",
    debug: {
      apollo_key_set: !!process.env.APOLLO_API_KEY,
      lusha_key_set: !!process.env.LUSHA_API_KEY,
    },
  });
};
