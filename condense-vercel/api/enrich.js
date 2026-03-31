export default async function handler(req, res) {
 if (req.method !== "POST") return res.status(405).end();
  
  try {
    if (!req.body) return res.status(400).json({ found: false, error: "Empty request body" });
    const { name, company, jobTitle, linkedinUrl } = req.body;
    if (!company) return res.status(400).json({ found: false, error: "Company is required" });
const cleanName = (name || "").trim();
const firstName = cleanName.split(" ")[0];
const lastName = cleanName.split(" ").slice(1).join(" ");

// A real name: 2-4 words, no title keywords, no special chars like &/
// A job title: contains role words, OR has & / - in it, OR is very long
const titleKeywords = ["VP", "Head", "Director", "Manager", "Lead", "Chief", "CTO", "CEO", "CIO", "President", "Engineer", "Analyst", "Architect", "Officer", "Founder", "Partner", "Consultant", "Associate", "Senior", "Junior", "Software", "Product", "Data", "Cloud", "Platform", "Enterprise", "Customer", "Business", "Technical", "Principal"];
const wordCount = cleanName.split(" ").filter(Boolean).length;
const hasTitleKeyword = titleKeywords.some(t => cleanName.includes(t));
const hasSpecialChars = /[&\/\|]/.test(cleanName);
const looksLikeTitle = !cleanName || hasTitleKeyword || hasSpecialChars || wordCount > 5;

console.log("ENRICH REQUEST:", { name: cleanName, company, jobTitle, looksLikeTitle, wordCount, hasTitleKeyword });
// Only treat as title if: no name provided, OR name contains a title word AND has no typical name structure
const wordCount = (name || "").split(" ").filter(Boolean).length;
const containsTitleWord = titleWords.some(t => (name || "").includes(t));
const looksLikeTitle = !name || (containsTitleWord && wordCount <= 4) || wordCount > 5;
  console.log("ENRICH REQUEST:", { name, company, jobTitle, looksLikeTitle });

  // ── APOLLO ──────────────────────────────────────────────────────────────────
  if (process.env.APOLLO_API_KEY) {
    try {
      let apolloUrl, apolloBody;

      if (looksLikeTitle) {
        // No real name — search by company + title to DISCOVER the person
        apolloUrl = "https://api.apollo.io/v1/mixed_people_search";
        apolloBody = {
          api_key: process.env.APOLLO_API_KEY,
          organization_names: [company],
          titles: [name || jobTitle],   // "VP Data Engineering" etc
          page: 1,
          per_page: 3,
        };
      } else {
        // Real name known — match directly
        apolloUrl = "https://api.apollo.io/v1/people/match";
        apolloBody = {
          api_key: process.env.APOLLO_API_KEY,
          first_name: firstName,
          last_name: lastName,
          organization_name: company,
          title: jobTitle || "",
          ...(linkedinUrl ? { linkedin_url: linkedinUrl } : {}),
          reveal_personal_emails: true,
          reveal_phone_number: true,
        };
      }

      const apolloRes = await fetch(apolloUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apolloBody),
      });

      const apolloData = await apolloRes.json();
      console.log("APOLLO STATUS:", apolloRes.status);
      console.log("APOLLO FULL RESPONSE:", JSON.stringify(apolloData));

      // Handle search response (array of people)
     if (looksLikeTitle) {
        const person = apolloData?.people?.[0];
        if (person) {
          // Return whatever we have — even name-only if email is gated on paid plan
          // For gated emails on free Apollo plan, try to reveal via match endpoint
let revealedEmail = person.email || "";
let revealedPhone = person.phone_numbers?.[0]?.sanitized_number || "";
if (!revealedEmail && person.id) {
  try {
    const revealRes = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.APOLLO_API_KEY,
        id: person.id,
        reveal_personal_emails: true,
        reveal_phone_number: true,
      }),
    });
    const revealData = await revealRes.json();
    revealedEmail = revealData?.person?.email || "";
    revealedPhone = revealData?.person?.phone_numbers?.[0]?.sanitized_number || revealedPhone;
  } catch(e) { /* silent */ }
}
return res.json({
  source: revealedEmail ? "Apollo" : "Apollo (name only)",
  found: true,
  name: `${person.first_name || ""} ${person.last_name || ""}`.trim(),
  email: revealedEmail,
  phone: revealedPhone,
  linkedinUrl: person.linkedin_url || linkedinUrl || "",
  title: person.title || jobTitle || "",
  company: person.organization?.name || company,
});
        }
        console.log("APOLLO: No people found for this title/company — trying Lusha");
      } else {
        // Handle match response (single person)
        const person = apolloData?.person;
        if (person && (person.email || person.phone_numbers?.length)) {
          return res.json({
            source: "Apollo",
            found: true,
            name: `${person.first_name || ""} ${person.last_name || ""}`.trim(),
            email: person.email || "",
            phone: person.phone_numbers?.[0]?.sanitized_number || "",
            linkedinUrl: person.linkedin_url || linkedinUrl || "",
            title: person.title || jobTitle || "",
            company: person.organization?.name || company,
          });
        }
        console.log("APOLLO: Match found no email/phone — trying Lusha");
      }

    } catch (err) {
      console.error("Apollo error:", err.message);
    }
  }

  // ── LUSHA ───────────────────────────────────────────────────────────────────
  if (process.env.LUSHA_API_KEY) {
    try {
      let lushaRes, lushaData;

      if (looksLikeTitle) {
        // Search by company + title
        const params = new URLSearchParams({
          company: company,
          title: name || jobTitle || "",
        });
        lushaRes = await fetch(
          `https://api.lusha.com/v2/search/person?${params.toString()}`,
          { method: "GET", headers: { "api_key": process.env.LUSHA_API_KEY } }
        );
      } else {
        // Match by name + company
        const params = new URLSearchParams({
          firstName,
          lastName,
          company,
        });
        lushaRes = await fetch(
          `https://api.lusha.com/v2/person?${params.toString()}`,
          { method: "GET", headers: { "api_key": process.env.LUSHA_API_KEY } }
        );
      }

      lushaData = await lushaRes.json();
      console.log("LUSHA STATUS:", lushaRes.status);
      console.log("LUSHA RESPONSE:", JSON.stringify(lushaData).slice(0, 600));

      // Handle search result (array) vs match result (single)
      const lushaRecord = lushaData?.data?.[0] || lushaData;
      const hasContact = lushaRecord?.emailAddresses?.length || lushaRecord?.phoneNumbers?.length;

      if (hasContact) {
        return res.json({
          source: "Lusha",
          found: true,
          name: lushaRecord.fullName || `${lushaRecord.firstName || ""} ${lushaRecord.lastName || ""}`.trim() || name || "",
          email: lushaRecord.emailAddresses?.[0]?.emailAddress || "",
          phone: lushaRecord.phoneNumbers?.[0]?.localNumber || "",
          linkedinUrl: linkedinUrl || "",
          title: lushaRecord.title || name || jobTitle || "",
          company: lushaRecord.company || company,
        });
      }

      console.log("LUSHA: No contact found");
    } catch (err) {
      console.error("Lusha error:", err.message);
    }
  }
return res.status(404).json({
      found: false,
      error: "No data found",
      debug: {
        apollo_key_set: !!process.env.APOLLO_API_KEY,
        lusha_key_set: !!process.env.LUSHA_API_KEY,
        mode: looksLikeTitle ? "search-by-title" : "match-by-name",
      },
    });

  } catch (err) {
    console.error("ENRICH HANDLER CRASH:", err.message);
    return res.status(500).json({ found: false, error: err.message });
  }
}
