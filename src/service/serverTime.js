import { getServerTime as getServerTimeFromApi } from '../api/serverTime.js';

let cachedTime;
let cachedServerTime;

export async function getServerTime(serverTime) {
    const currentTime = new Date();

    try {
        return updateServerTime(cachedTime, cachedServerTime, currentTime);
    } catch (error) {
        const serverTimeFromApi = { ...await getServerTimeFromApi(serverTime) };
        cachedServerTime = serverTimeFromApi
        cachedTime = currentTime.toISOString();

        return serverTimeFromApi;
    }
}

function updateServerTime(cachedTime, cachedServerTime, currentTime) {
    if(cachedTime === undefined) {
        throw new Error('Cached time is undefined');
    }

    if(cachedTime) {
        const lastFetchedTime = new Date(cachedTime).getTime();
        const timeDifference = currentTime.getTime() - lastFetchedTime;
    
        if(timeDifference > 1000) {
            const serverTime = { ...cachedServerTime };
            const updatedServerTime = new Date(serverTime.dateTime);
            updatedServerTime.setSeconds(updatedServerTime.getSeconds() + Math.floor(timeDifference / 1000));

            serverTime.dateTime = updatedServerTime.toISOString();
            serverTime.date = `${updatedServerTime.getFullYear()}-${updatedServerTime.getMonth() + 1}-${updatedServerTime.getDate()}`
            serverTime.time = `${updatedServerTime.getHours() < 10 ? '0' : ''}${updatedServerTime.getHours()}:${updatedServerTime.getMinutes() < 10 ? '0' : ''}${updatedServerTime.getMinutes()}`
    
            return serverTime;
        }
    }
}