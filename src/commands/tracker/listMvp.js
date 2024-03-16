import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createBossListEmbed } from "../../embeds/index.js";
import { createPaginationButtons } from "../../rows/index.js";
import { Boss, BossAlias, TrackerChannel } from "../../models/index.js";
import { getBossValuesField, formatBossesData, getPaginationValues } from "../../utils/general.js";

const command = new SlashCommandBuilder()
    .setName('listmvp')
    .setDescription('Displays the list of MVPs that are currently settled on guild')
command.aliases = ['lm', 'listmvp', 'lmvp'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;

    await runCommand(send, guild, embedColor, interaction);
};

async function runCommand(send, guild, embedColor, interaction) {
    const trackerChannel = await TrackerChannel.findOne({
        where: {guild_id: guild.id}
    });
    
    if(trackerChannel) {
        try {
            const bosses = await Boss.findAll({
                where: {
                    guild_id: guild.id
                },
                include: [{
                    model: BossAlias,
                    attributes: ['boss_alias']
                }]
            });
            const hasBosses = bosses.length > 0;

            if(hasBosses) {
                const formattedBosses = formatBossesData(bosses);
                const bossesValuesString = formattedBosses.map((boss) => {
                    const bossValues = getBossValuesField(boss);
                    
                    return bossValues;
                });
                
                let currentPage = 0;
                const itemsPerPage = 5;

                let { bossList, bossListLength, firstOnPage, lastOnPage, totalPages } = getPaginationValues(currentPage, itemsPerPage, bossesValuesString);
                const bossListEmbed = createBossListEmbed(bossList, bossListLength, currentPage, totalPages, guild, embedColor);
                const paginationButtons = createPaginationButtons(bossListLength, currentPage, firstOnPage, lastOnPage);
                const message = await send({ embeds: [bossListEmbed], components: [paginationButtons] });

                const paginationInteractionFilter = (i) => i.user.id === interaction.user.id;
                const THREE_MINUTES = 180000;
                const collector = message.createMessageComponentCollector({ filter: paginationInteractionFilter, time: THREE_MINUTES });

                collector.on('collect', async (button) => {
                    if(button.customId === 'back') {
                        currentPage --;
                    } else if(button.customId === 'forward') {
                        currentPage ++;
                    };

                    const { bossList, lastOnPage, firstOnPage, totalPages } = getPaginationValues(currentPage, itemsPerPage, bossesValuesString);
                    const embed = createBossListEmbed(bossList, bossListLength, currentPage, totalPages, guild, embedColor);
                    const paginationButtons = createPaginationButtons(bossListLength, currentPage, firstOnPage, lastOnPage);
                    message.edit({ embeds: [embed], components: [paginationButtons] });
                    await button.deferUpdate();
                });
                
                collector.on('end', () => {
                    if(reason === 'time') {
                        try {
                            message.edit({ components: [] });
                        } catch (error) {
                            console.log(`There was an error while deleting the pagination buttons ${error}`);
                        };
                    }
                });

            } else {
                const noBossesTitle = 'No MVPs found';
                const noBossesMessage = 'There are no MVPs that are currently settled on your tracker';
                const noBossesFooter = 'Check /mvphelp for more information or use /setmvp to add an mvp';
    
                await send({ embeds: [createMessageEmbed(noBossesTitle, noBossesMessage, embedColor, '❌', noBossesFooter)] });
            }
    
        } catch(error) {
            console.log(`There was an error while listing the MVPs ${error}`);
    
            const errorTitle = 'An error occurred while fetching the list of MvPs'
            const errorMessage = 'Please try using /listmvp again later'
            const errorFooter = 'For more information use /mvphelp'
            
            await send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
        };
    } else {
        const noTrackerChannelTitle = 'No tracker channel found';
        const noTrackerMessage = 'Please configure the tracker channel first';
        const noTrackerFooter = 'Use /settrackerchannel to create your own tracker channel';

        await send({ embeds: [createMessageEmbed(noTrackerChannelTitle, noTrackerMessage, embedColor, '❌', noTrackerFooter)] }); 
    };
};

export default command;