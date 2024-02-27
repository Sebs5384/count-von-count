import { EmbedBuilder } from "discord.js";

function createInfoEmbed(authorMessage, descriptionMessage, fieldName, fieldValue, embedColor, botIcon) {

    return new EmbedBuilder()
        .setAuthor({ name: authorMessage, iconURL: botIcon })
        .setDescription(descriptionMessage)
        .addFields({name: fieldName, value: fieldValue})
        .setFooter({ text: 'Ha ha ha, glad to help you !'})
        .setColor(embedColor)
}

export default createInfoEmbed;
