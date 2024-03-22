import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

function createSuperQuestItemButtonsRow(sqi) {
    const ingredientsButton = new ButtonBuilder()
        .setCustomId('sqiingredients')
        .setLabel('Ingredients')
        .setStyle(ButtonStyle.Secondary);

    const bonusesButton = new ButtonBuilder()
        .setCustomId('sqibonuses')
        .setLabel('Bonuses')
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder({
        components: [
            ingredientsButton,
            bonusesButton
        ]
    });
};

export default createSuperQuestItemButtonsRow;