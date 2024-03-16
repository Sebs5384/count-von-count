import { EmbedBuilder } from "discord.js";

function createBossListEmbed(bossList, bossListLength, currentPage, totalPages, guild, embedColor) {
    return new EmbedBuilder()
        .setTitle(`${guild.name} MvP List`)
        .setThumbnail(guild.iconURL())
        .setDescription(`**Here's the list of all the MvPs that are currently settled**.\nCurrent amount: ${bossListLength}`)
        .addFields(bossList)
        .setColor(embedColor)
        .setFooter({ text: `If you wish to manage these bosses use /editmvp, /removemvp, /setalias or /setmvp.\nPage ${currentPage + 1} of ${totalPages}` });
};

export default createBossListEmbed;