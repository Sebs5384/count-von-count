import { EmbedBuilder } from "discord.js";

function createMonsterEmbed(monsterName, monsterMap, monsterQuantity, monsterImage, mapImage, mapLink, missionAmount, monsterSpawnWindow, monsterPath, embedColor, authorIcon = null) {
    return new EmbedBuilder()
        .setAuthor({ name: monsterName, iconURL: authorIcon })
        .setTitle(monsterMap)
        .setURL(mapLink)
        .setDescription(monsterPath)
        .setThumbnail(monsterImage)
        .setImage(mapImage)
        .addFields(
            { name: 'Quantity in Map', value: monsterQuantity, inline: false},
            { name: 'Mission Amount', value: missionAmount, inline: false },
            { name: 'Spawn Window', value: monsterSpawnWindow, inline: false },
        )
        .setColor(embedColor);
};

export default createMonsterEmbed;
