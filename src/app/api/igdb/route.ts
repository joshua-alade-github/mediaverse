import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { query, endpoint } = await req.json();
        console.log(`IGDB API request to endpoint: ${endpoint}`);
        console.log(`Query: ${query}`);

        const apiKey = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_IGDB_CLIENT_SECRET;

        if (!apiKey || !clientSecret) {
            console.error("Missing IGDB API keys");
            return NextResponse.json({ error: "Missing IGDB API keys" }, { status: 500 });
        }

        // Get access token
        const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${apiKey}&client_secret=${clientSecret}&grant_type=client_credentials`, {
            method: 'POST'
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("Token Error:", errorData);
            return NextResponse.json({ error: `Failed to get access token: ${tokenResponse.status}` }, { status: 500 });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Make request to IGDB API
        console.log(`Making request to IGDB endpoint: ${endpoint}`);
        const igdbResponse = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
            method: 'POST',
            headers: {
                'Client-ID': apiKey,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            },
            body: query,
        });

        if (!igdbResponse.ok) {
            const errorText = await igdbResponse.text();
            console.error("IGDB Error:", errorText);
            return NextResponse.json({ error: errorText }, { status: igdbResponse.status });
        }

        const data = await igdbResponse.json();
        console.log(`IGDB response received with ${data.length} items`);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("IGDB Proxy Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to fetch from IGDB API' }, { status: 500 });
    }
}