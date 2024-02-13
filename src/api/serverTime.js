const URL = 'https://timeapi.io/api/Time/current';

async function getServerTime(timeZone) {
  const timeZoneURL = `${URL}/zone?timeZone=${timeZone}`

  return await fetch(timeZoneURL)
    .then((response) => response.json())
    .catch((error) => {
      throw new Error(error);
    });  
};

export default getServerTime;