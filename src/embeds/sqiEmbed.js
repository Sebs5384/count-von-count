import { EmbedBuilder } from "discord.js";

function createSqiEmbed(sqi, embedColor) {
    return new EmbedBuilder()
        .setAuthor({ name: sqi.name, iconURL: sqi.icon})
        .setThumbnail(sqi.image)
        .addFields(
            { name: 'Description', value: sqi.description },
            { name: 'Stats', value: sqi.stats.map(stat => `${stat}`).join('\n') },
            { name: 'Item Class', value: sqi.itemClass },
            { name: 'Defense Rate', value: sqi.defenseRate },
            { name: 'Weight', value: sqi.weight },
            { name: 'Required Level', value: sqi.requiredLevel },
            { name: 'Application Jobs', value: sqi.applicationJobs.map(job => `${job}`).join('\n') },
            { name: 'Crafting Ingredients', value: sqi.ingredients.map(ingredient => `- ${ingredient}`).join('\n') },
            { name: 'SQI Bonuses', value: sqi.bonuses.map(bonus => `- ${bonus}`).join('\n') }
        )
        .setFooter({ text: 'To check the full list of SQI use /listsqi'})
        .setColor(embedColor)
};

export default createSqiEmbed;
