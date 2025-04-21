import { EmbedBuilder } from "discord.js";

function createInfoEmbed(authorMessage, descriptionMessage, fields, footer, embedColor, botIcon) {

    return new EmbedBuilder()
        .setAuthor({ name: authorMessage, iconURL: botIcon })
        .setDescription(descriptionMessage)
        .addFields(fields)
        .setFooter({ text: footer })
        .setColor(embedColor)
}

export default createInfoEmbed;
