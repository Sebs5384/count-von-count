const BASE_URL = 'https://ragnarok-maps-git-main-5384s-projects.vercel.app';

export async function getMapLocation(cordinateX, cordinateY, map) {
    const mapLocationUrl = `${BASE_URL}/api/locate?map=${map}&x=${cordinateX}&y=${cordinateY}`;

    try {
        const response = await fetch(mapLocationUrl, { method: 'HEAD' });
        if(!response.ok) {
            throw new Error(`Failed to fetch map location. Status: ${response.status}`);
        };

        return mapLocationUrl;
    } catch (error) {
        console.error(error);
        return null;
    };
};