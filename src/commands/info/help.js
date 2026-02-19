import { SlashCommandBuilder } from "discord.js";
import { createInfoEmbed } from "../../embeds/index.js";
import { createPaginationButtons } from "../../rows/index.js";
import { getPaginationValues, chunkIntoColumns } from "../../utils/general.js";


const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all the commands and their descriptions')
command.aliases = ['h', 'commands', 'cmds'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);

    await runCommand(client, guild, send, interaction);
};

async function runCommand(client, guild, send, interaction) {
    const countVonCount = await client.users.fetch(client.config.botId);
    const embedColor = client.config.embedColor;
    const commands = client.commands;
    const commandValues = [...commands.values()];
    
    let currentPage = 0;
    const itemsPerPage = 10;
    const { list, listLength, firstPage, lastPage, totalPages } = getPaginationValues(currentPage, itemsPerPage, commandValues);
    const columns = chunkIntoColumns(list, 2);
    const helpTitle = 'List of commands 🔍';
    const botIcon = countVonCount.displayAvatarURL({ dynamic: true, size: 2048 });
    const helpDescription = `**Here is a list of all commands available and their descriptions**`;
    const helpFieldName = '**Commands**';
    const helpFooter = `Page ${firstPage + 1} of ${totalPages}`;
    const helpFieldValue = columns.map(column => ({
        name: '\u200B',
        value: column.map(c => `\`${c.name}\`\n${c.description}`).join('\n\n'),
        inline: true 
    }));


    console.log(list);
    console.log(typeof helpFieldValue);

    const embed = createInfoEmbed(helpTitle, helpDescription, helpFieldValue, helpFooter, embedColor, botIcon);
    const buttons = createPaginationButtons(listLength, currentPage, firstPage, lastPage);

    const message = await send({
        embeds: [embed],
        components: [buttons]
    });

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

        const { list, lastPage, firstPage, totalPages } = getPaginationValues(currentPage, itemsPerPage, commandValues);
        const columns = chunkIntoColumns(list, 2);
        const helpFieldValue = columns.map(column => ({
            name: '\u200B',
            value: column.map(c => `\`${c.name}\`\n${c.description}`).join('\n\n'),
            inline: true 
        }));
        const helpFooter = `Page ${currentPage + 1} of ${totalPages}`;

        const embed = createInfoEmbed(helpTitle, helpDescription, helpFieldValue, helpFooter, embedColor, botIcon);
        const buttons = createPaginationButtons(listLength, currentPage, firstPage, lastPage);

        message.edit({ embeds: [embed], components: [buttons] });
    });

    collector.on('end', (collector, reason) => {
        if(reason === 'time') {
            try {
                message.edit({ components: [] });
            } catch (error) {
                console.log(error);
            };
        };
    });
};

export default command;