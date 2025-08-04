import config from '../../config.json' with { type: 'json' };

export async function getMapLocation(x, y, map) {
    const BASE_URL = config.BASE_URL;
    const mapLocationUrl = `${BASE_URL}/api/bot/location-url`;

    try {
        const response = await fetch(mapLocationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Auth': config.BOT_KEY
            },
            body: JSON.stringify({ map, x: String(x), y: String(y) })
        });

        if(!response.ok) {
            const text = await response.text();
            throw new Error(`Failed to fetch map location. Status: ${response.status}. Message: ${text}`);
        };

        const location = await response.json();

        return location;
    } catch (error) {
        console.error(error);
        return null;
    };
};