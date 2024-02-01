import { EmbedBuilder } from "discord.js";

function createMessageEmbed(message, description, embedColor, state) {
    return new EmbedBuilder()   
        .setTitle(`${state ? '✅' : '❌'} ${message} `)
        .setDescription(description)
        .setColor(embedColor);
}

export default createMessageEmbed;