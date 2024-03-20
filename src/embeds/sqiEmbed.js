import { EmbedBuilder } from "discord.js";

function createSqiEmbed(sqi, fields, embedColor) {
    return new EmbedBuilder()
        .setAuthor({ name: sqi.name, iconURL: sqi.icon})
        .setThumbnail(sqi.image)
        .addFields(fields)
        .setFooter({ text: 'To check the full list of SQI use /listsqi'})
        .setColor(embedColor)
};

export default createSqiEmbed;
