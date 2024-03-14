import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

function createPaginationButtons(list, page, items) {
    let itemsPerPage = items;
    let firstOnPage = page * itemsPerPage;
    let lastOnPage = firstOnPage + itemsPerPage;

    const backButton = new ButtonBuilder({
        style: ButtonStyle.Primary,
        emoji: '◀',
        customId: 'back',
        disabled: page === 0
    });

    const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Primary,
        emoji: '▶',
        customId: 'forward',
        disabled: list.length <= lastOnPage
    });

    return new ActionRowBuilder({
        components: [
            backButton,
            forwardButton
        ]
    });
};