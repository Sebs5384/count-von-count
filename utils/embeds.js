import { EmbedBuilder } from 'discord.js';

export function createBirthdayListEmbed(client, guild, birthdayList) {
    const guildName = guild.name;
  
    return new EmbedBuilder()
      .setTitle(`🍰 ${guildName} Guild Upcoming Birthday List`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
      .setDescription(`Here is the list of users with their birthday \n${birthdayList}`)
      .setColor(client.config.embedColor);
}

export function birthdayMessageEmbed(client, guild, user) {}