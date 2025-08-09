import config from '../../config.json' with { type: 'json' };

export async function getMap(name) {
    try {
        const mapUrl = `${config.BASE_URL}/api/map?name=${name}`;

        const response = await fetch(mapUrl, { method: 'GET' });
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
        return null;
    };
};