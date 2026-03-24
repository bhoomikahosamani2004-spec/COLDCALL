export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Step 1 — get fresh access token
    const tokenParams = new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token"
    });

    const tokenRes = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: "Could not get Zoho access token" });
    }

    // Step 2 — push to Zoho CRM
    const { prospect, messages } = req.body;
    const nameParts = (prospect.name || "").split(" ");

    const payload = {
      data: [{
        First_Name: nameParts[0] || "-",
        Last_Name: nameParts.slice(1).join(" ") || nameParts[0] || "-",
        Email: prospect.email || "",
        Phone: prospect.phone || "",
        Company: prospect.company || "",
        Designation: prospect.jobTitle || "",
        Lead_Source: "Condense Outreach App",
        Description: messages?.email_body
          ? `Subject: ${messages.email_subject || ""}\n\n${messages.email_body.slice(0, 1000)}`
          : `Status: ${prospect.status}`,
      }]
    };

    const zohoRes = await fetch("https://www.zohoapis.in/crm/v3/Leads", {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const zohoData = await zohoRes.json();
    res.json(zohoData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
