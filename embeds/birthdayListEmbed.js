import { EmbedBuilder } from 'discord.js';

function createBirthdayListEmbed(embedColor, guildIcon, guildName, birthdayList) {
    return new EmbedBuilder()
      .setTitle(`🍰 ${guildName} Upcoming Birthday List`)
      .setThumbnail(guildIcon)
      .setDescription(`Here is the list of users with their birthday \n${birthdayList}`)
      .setColor(embedColor);
}

export default createBirthdayListEmbed;