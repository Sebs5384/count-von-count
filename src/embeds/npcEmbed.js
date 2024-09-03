import { EmbedBuilder } from "discord.js";

function createNpcEmbed(npcName, npcMap, mapLink, mapImage, npcImage, npcPath, embedColor, authorIcon = null) {
    return new EmbedBuilder()
        .setAuthor({ name: npcName, iconURL: authorIcon })
        .setTitle(npcMap)
        .setURL(mapLink)
        .setDescription(npcPath)
        .setThumbnail(npcImage)
        .setImage(mapImage)
        .setColor(embedColor);
};

export default createNpcEmbed;
