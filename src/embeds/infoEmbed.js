import { EmbedBuilder } from "discord.js";

function createInfoEmbed(authorMessage, descriptionMessage, fieldName, fieldValue, footer, embedColor, botIcon) {

    return new EmbedBuilder()
        .setAuthor({ name: authorMessage, iconURL: botIcon })
        .setDescription(descriptionMessage)
        .addFields({name: fieldName, value: fieldValue})
        .setFooter({ text: footer })
        .setColor(embedColor)
}

export default createInfoEmbed;
