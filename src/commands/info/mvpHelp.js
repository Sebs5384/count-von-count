import { SlashCommandBuilder } from "discord.js";
import { getCommandsByFolder, getMvpHelpFieldValue } from "../../utils/general.js";
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
    
    const mvpHelpTitle = `List of commands related to the MvP Tracker 🔍`;
    const mvpHelpDescription = `**Below is a description of each command and their options**`;
    const mvpHelpFieldName = `**Tracker commands**`
    const mvpHelpFieldValue = getMvpHelpFieldValue(commandsFromTracker);
    const mvpHelpFooter = `If you wish to obtain more information of an specific command use /mvphelp <command>`
    const botIcon = countVonCount.displayAvatarURL({ dynamic: true, size: 2048 });
    const embedColor = client.config.embedColor;

   
    await send({ embeds: [createInfoEmbed(mvpHelpTitle, mvpHelpDescription, mvpHelpFieldName, mvpHelpFieldValue, mvpHelpFooter, embedColor, botIcon)] });

};

export default command