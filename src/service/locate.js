import { getMapLocation as getMapLocationFromApi } from "../api/locate.js";

const mapLocationCache = {};

export async function getMapLocation(cordinateX, cordinateY, map) {
    const cachedKey = `${map}:${cordinateX}:${cordinateY}`;
    if(mapLocationCache[cachedKey]) return mapLocationCache[cachedKey];

    try {
        const mapLocationFromApi = await getMapLocationFromApi(cordinateX, cordinateY, map);
        
        mapLocationFromApi ? mapLocationCache[cachedKey] = {
            mapName: map,
            cordinateX: cordinateX,
            cordinateY: cordinateY,
            locationUrl: mapLocationFromApi.locationUrl
        } : null;

        return mapLocationFromApi;
    } catch (error) {
        console.error(error);
        return null;
    };
};
