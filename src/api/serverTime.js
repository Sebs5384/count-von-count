import config from '../../config.json' with { type: 'json' };

export async function getServerTime(timeZone) {
  const timeZoneURL = `${config.TIME_BASE_URL}/zone?timeZone=${timeZone}`;

  return await fetch(timeZoneURL)
    .then((response) => response.json())
    .catch((error) => {
      throw new Error(error);
    })
    .finally(() => {
      console.log(`Warning, using API call URL: ${timeZoneURL}`)
    })
};
