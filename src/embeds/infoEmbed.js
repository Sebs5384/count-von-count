import { EmbedBuilder } from "discord.js";

function createInfoEmbed(
    authorMessage,
    descriptionMessage,
    fields,
    footer,
    embedColor,
    botIcon
) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: authorMessage, iconURL: botIcon })
        .setDescription(descriptionMessage)
        .setFooter({ text: footer })
        .setColor(embedColor);

    if (Array.isArray(fields)) {
        embed.addFields(fields);
    } else {
        embed.addFields({
            name: fields.name,
            value: fields.value,
            inline: fields.inline ?? false
        });
    };

    return embed;
}

export default createInfoEmbed;

