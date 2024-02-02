import { EmbedBuilder } from "discord.js";

function createMessageEmbed(message, description, embedColor, emoji = '') {
    return new EmbedBuilder()   
        .setTitle(`${emoji}  ${message} `)
        .setDescription(description)
        .setColor(embedColor);
}

export default createMessageEmbed;