import { EmbedBuilder } from 'discord.js';

function createRaceEmbed(raceTitle, raceList, embedColor, raceFooter) {
    const raceEmbed = new EmbedBuilder()
        .setTitle(raceTitle)
        .setColor(embedColor)
        .setFooter({ text: raceFooter })
    if(raceList) {
        raceEmbed.addFields(raceList)
    };

    return raceEmbed;
};

export default createRaceEmbed;