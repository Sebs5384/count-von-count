import { EmbedBuilder } from "discord.js";

function createListEmbed(title, thumbnailIcon, description, list, embedColor, footer) {
    return new EmbedBuilder()
        .setTitle(title)
        .setThumbnail(thumbnailIcon)
        .setDescription(description)
        .addFields(list)
        .setColor(embedColor)
        .setFooter({ text: footer });
};

export default createListEmbed;