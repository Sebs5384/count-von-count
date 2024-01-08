import { EmbedBuilder } from 'discord.js';

export function createBirthdayListEmbed(embedColor, guildIcon, guildName, birthdayList) {

    return new EmbedBuilder()
      .setTitle(`🍰 ${guildName} Guild Upcoming Birthday List`)
      .setThumbnail(guildIcon)
      .setDescription(`Here is the list of users with their birthday \n${birthdayList}`)
      .setColor(embedColor);
}

export function birthdayMessageEmbed(client, guild, user) {}