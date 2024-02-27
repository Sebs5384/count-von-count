import { EmbedBuilder } from "discord.js";

function createBossListEmbed(bossList, guild, embedColor) {
    return new EmbedBuilder()
        .setTitle(`${guild.name} MvP List`)
        .setThumbnail(guild.iconURL())
        .setDescription(`**Here's the list of all the MvPs that are currently settled**.\nCurrent amount: ${bossList.length}`)
        .addFields(bossList)
        .setColor(embedColor)
        .setFooter({ text: 'If you wish to manage these bosses use /editmvp, /removemvp or /setmvp' });
};

export default createBossListEmbed;