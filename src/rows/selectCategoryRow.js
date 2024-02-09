import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

function createSelectCategoryRow(options) {
    return  new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectcategory')
                .setPlaceholder('Click to view categories')
                .addOptions(options.map(option => ({ label: option.label, value: option.value }))),
    );
};

export default createSelectCategoryRow;