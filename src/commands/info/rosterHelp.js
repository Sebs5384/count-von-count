import { SlashCommandBuilder } from "discord.js";
import { getCommandsByFolder, getHelpFields, getCommandOptionValues, getPaginationValues } from "../../utils/general.js";
import { createInfoEmbed, createListEmbed, createMessageEmbed } from "../../embeds/index.js";
import { createPaginationButtons } from "../../rows/index.js";

const command = new SlashCommandBuilder()
    .setName('rosterhelp')
    .setDescription('Shows all the commands related to the Roster and their usage')
    .addStringOption((option) => option
        .setName('command-name')
        .setDescription('Input the name of the command to get more information e.g setroster')
        .setRequired(false)
    )
command.aliases = ['rostercommands', 'rhelp', 'rosterhelp'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = interaction.guild;
    const embedColor = client.config.embedColor;
    const commandName = interaction.options.getString('command-name');
    const rosterFolderPath = './src/commands/roster';
    const countVonCount = await client.users.fetch(client.config.botId);
    const botIcon = countVonCount.displayAvatarURL({ dynamic: true, size: 2048 });
    const commandsFromRoster = await getCommandsByFolder(client, rosterFolderPath);

    await runCommand(send, guild, embedColor, commandName, commandsFromRoster, botIcon, interaction);
};

async function runCommand(send, guild, embedColor, commandName, commandsFromRoster, botIcon, interaction) {
    try {
        if(commandName) {
            const selectedCommand = commandsFromRoster.find((command) => command.name === commandName.toLowerCase());
            const selectedCommandOptions = selectedCommand.options;

            const rosterHelpTitle = `Command selected 🔍`;
            const rosterHelpDescription = '**Below is the description of the command, its options and usage**';
            const rosterHelpFieldName = `**Name: /${selectedCommand.name}\nDescription: ${selectedCommand.description}**\n\n**Options**`;
            const rosterHelpFieldValue = getCommandOptionValues(selectedCommandOptions);
            const rosterHelpFooter = `If you wish to see the full list run /rosterhelp with no command name`

            await send({ embeds: [
                createInfoEmbed(
                    rosterHelpTitle,
                    rosterHelpDescription,
                    rosterHelpFieldName,
                    rosterHelpFieldValue,
                    rosterHelpFooter,
                    embedColor,
                    botIcon
                )
            ]});

            return;
        };

        let currentPage = 0;
        const itemsPerPage = 5;
        const { list, listLength, firstPage, lastPage, totalPages } = getPaginationValues(currentPage, itemsPerPage, commandsFromRoster);
        const rosterHelpTitle = 'List of commands related to the Roster';
        const rosterHelpDescription = '**Below is a description of each command and their options**';
        let rosterHelpFooter = `If you wish to obtain more information of an specific command use /rosterhelp <command>\nPage ${currentPage + 1} of ${totalPages}`;
        const rosterFieldList = getHelpFields(list);

        const message = await send({ embeds: [
            createListEmbed(
                rosterHelpTitle,
                null,
                rosterHelpDescription,
                rosterFieldList,
                embedColor,
                rosterHelpFooter
            )], components: [
                createPaginationButtons(
                    listLength,
                    currentPage,
                    firstPage,
                    lastPage
                )
            ]});

            const paginationInteractionFilter = (i) => i.user.id === interaction.user.id;
            const THREE_MINUTES = 180000;
            const collector = message.createMessageComponentCollector({ filter: paginationInteractionFilter, time: THREE_MINUTES });

            collector.on('collect', async (button) => {
                await button.deferUpdate();

                if(button.customId === 'back') {
                    currentPage --;
                } else if(button.customId === 'next') {
                    currentPage ++;
                };

                const { list, listLength, firstPage, lastPage, totalPages } = getPaginationValues(currentPage, itemsPerPage, commandsFromRoster);
                let rosterHelpFooter = `If you wish to obtain more information of an specific command use /rosterhelp <command>\nPage ${currentPage + 1} of ${totalPages}`;
                const rosterFieldList = getHelpFields(list);
                
                message.edit({ embeds: [
                    createListEmbed(
                        rosterHelpTitle,
                        null,
                        rosterHelpDescription,
                        rosterFieldList,
                        embedColor,
                        rosterHelpFooter
                    )
                ], components: [
                    createPaginationButtons(
                        listLength,
                        currentPage,
                        firstPage,
                        lastPage
                    )
                ]});
            });

            collector.on('end', async (collected, reason) => {
                if(reason === 'time') {
                    message.edit({ components: [] });
                };
            });
    } catch (error) {
        console.error(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'There was an error while displaying the commands related to the Roster',
                embedColor,
                '❌'
            )
        ]});
    };
};

export default command;