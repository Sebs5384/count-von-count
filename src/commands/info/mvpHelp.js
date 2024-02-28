import { SlashCommandBuilder } from "discord.js";
import { getCommandsByFolder } from "../../utils/general.js";
import { createInfoEmbed } from "../../embeds/index.js";

const command = new SlashCommandBuilder()
    .setName('mvphelp')
    .setDescription('Shows all the commands related to the MvP tracker and their usage')
command.aliases = ['mhelp', 'mvphelp', 'mvpcommands'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);

    await runCommand(client, guild, send);
};

async function runCommand(client, guild, send) {
    const trackerFolderPath = './src/commands/tracker';
    const countVonCount = await client.users.fetch(client.config.botId);
    const commandsFromTracker = await getCommandsByFolder(client, trackerFolderPath);
    
    const mvpHelpTitle = `**List of commands related to the MvP Tracker 📖**`;
    const mvpHelpDescription = `**Below is a description of each command and a brief explanation of usage**`;
    const mvpHelpFieldName = `**Tracker commands**`
    
    const commandsWithOptions = commandsFromTracker.filter(command => command.options.length > 0);
    
};

export default command