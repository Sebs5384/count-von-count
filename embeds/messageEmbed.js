import { EmbedBuilder } from "discord.js";

function createMessageEmbed(message, description, embedColor, emoji = '', footer = '') {
    return new EmbedBuilder()   
        .setTitle(`${emoji}  ${message} `)
        .setDescription(description)
        .setFooter({ text: footer })
        .setColor(embedColor);
}

export default createMessageEmbed;