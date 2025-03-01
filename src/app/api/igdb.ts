import fetch from 'node-fetch';

export default async function handler(req, res) {
    const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN;

    if (!allowedOrigin) {
        console.error("Missing NEXT_PUBLIC_ALLOWED_ORIGIN environment variable.");
        return res.status(500).json({ error: "CORS configuration error." });
    }

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin); // Use the environment variable
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { query, endpoint } = req.body; // Expecting endpoint as well

    const apiKey = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_IGDB_CLIENT_SECRET;

    if (!apiKey || !clientSecret) {
        return res.status(500).json({ error: "Missing IGDB API keys. Check environment variables." });
    }

    try {
        const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${apiKey}&client_secret=${clientSecret}&grant_type=client_credentials`, {
            method: 'POST'
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Token Error:", errorData);
            throw new Error(`Failed to get access token: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const igdbResponse = await fetch(`https://api.igdb.com/v4/${endpoint}`, { // Use the provided endpoint
            method: 'POST',
            headers: {
                'Client-ID': apiKey,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: query,
        });

        if (!igdbResponse.ok) {
            const errorData = await igdbResponse.json();
            console.error("IGDB Error:", errorData);
            throw new Error(`IGDB API request failed: ${igdbResponse.status}`);
        }

        const data = await igdbResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: 'Failed to fetch from IGDB API' });
    }
}