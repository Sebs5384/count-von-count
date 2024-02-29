import { SlashCommandBuilder } from "discord.js";
import { getCommandsByFolder, getMvpHelpFieldValue, getCommandOptionValues } from "../../utils/general.js";
import { createInfoEmbed } from "../../embeds/index.js";

const command = new SlashCommandBuilder()
    .setName('mvphelp')
    .setDescription('Shows all the commands related to the MvP tracker and their usage')
    .addStringOption((option) => option
        .setName('command-name')
        .setDescription('Input the name of the command to get more information e.g setmvp')
        .setRequired(false)
    )
command.aliases = ['mhelp', 'mvphelp', 'mvpcommands'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const commandName = interaction.options.getString('command-name');

    await runCommand(client, guild, send, commandName);
};

async function runCommand(client, guild, send, commandName) {
    const trackerFolderPath = './src/commands/tracker';
    const countVonCount = await client.users.fetch(client.config.botId);
    const botIcon = countVonCount.displayAvatarURL({ dynamic: true, size: 2048 });
    const commandsFromTracker = await getCommandsByFolder(client, trackerFolderPath);
    const embedColor = client.config.embedColor;
    
    if (commandName) {
        const selectedCommand = commandsFromTracker.find((command) => command.name === commandName);
        const selectedCommandOptions = selectedCommand.options;

        const mvpHelpTitle = `Command selected 🔍`;
        const mvpHelpDescription = '**Below is the description of the command, its options and usage**';
        const mvpHelpFieldName = `**Name: /${selectedCommand.name}\nDescription: ${selectedCommand.description}**\n\n**Options**`;
        const mvpHelpFieldValue = getCommandOptionValues(selectedCommandOptions);
        const mvpHelpFooter = `If you wish to see the full list run /mvphelp with no command name`;

        await send({ embeds: [createInfoEmbed(mvpHelpTitle, mvpHelpDescription, mvpHelpFieldName, mvpHelpFieldValue, mvpHelpFooter, embedColor, botIcon)] });
    } else {
        const mvpHelpTitle = `List of commands related to the MvP Tracker 🔍`;
        const mvpHelpDescription = `**Below is a description of each command and their options**`;
        const mvpHelpFieldName = `**Tracker commands**`
        const mvpHelpFieldValue = getMvpHelpFieldValue(commandsFromTracker);
        const mvpHelpFooter = `If you wish to obtain more information of an specific command use /mvphelp <command>`

        await send({ embeds: [createInfoEmbed(mvpHelpTitle, mvpHelpDescription, mvpHelpFieldName, mvpHelpFieldValue, mvpHelpFooter, embedColor, botIcon)] });
    };
};

export default command