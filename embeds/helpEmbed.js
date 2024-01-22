import { EmbedBuilder } from "discord.js";

function createHelpEmbed(embedColor) {
    return new EmbedBuilder()
        .setColor(embedColor)
}

export default createHelpEmbed;