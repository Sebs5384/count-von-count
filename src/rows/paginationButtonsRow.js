import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

function createPaginationButtons(listLength, page, firstOnPage, lastOnPage) {
    const backButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '◀',
        customId: 'back',
        disabled: page === 0
    });

    const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '▶',
        customId: 'forward',
        disabled: listLength <= lastOnPage
    });

    return new ActionRowBuilder({
        components: [
            backButton,
            forwardButton
        ]
    });
};

export default createPaginationButtons;