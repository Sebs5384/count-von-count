import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

function createSuperQuestItemButtonsRow(currentButtons) {
    const ingredientsButton = new ButtonBuilder()
        .setCustomId('sqiingredients')
        .setLabel('Ingredients')
        .setStyle(ButtonStyle.Secondary);

    const bonusesButton = new ButtonBuilder()
        .setCustomId('sqibonuses')
        .setLabel('Bonuses')
        .setStyle(ButtonStyle.Secondary);

    const descriptionButton = new ButtonBuilder()
        .setCustomId('sqidescription')
        .setLabel('Item Description')
        .setStyle(ButtonStyle.Secondary);

    let buttons = currentButtons.map((buttonId) => {
        switch(buttonId) {
            case 'sqiingredients':
                return ingredientsButton;
            case 'sqibonuses':
                return bonusesButton;
            case 'sqidescription':
                return descriptionButton;
        }
    })
    
    return new ActionRowBuilder({
        components: buttons
    });
};

export default createSuperQuestItemButtonsRow;