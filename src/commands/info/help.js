import { SlashCommandBuilder } from "discord.js";
import { getCommandByType, getCommands } from "../../utils/general.js";
import { createHelpEmbed } from "../../embeds/index.js";


const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all the commands and descriptions')
command.aliases = ['h', 'commands', 'cmds'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);

    await runCommand(client, guild, send);
}

async function runCommand(client, guild, send) {
    const countVonCount = await client.users.fetch(client.config.botId);
    const embedColor = client.config.embedColor;
    const commands = client.commands;
    const botIcon = countVonCount.displayAvatarURL({ dynamic: true, size: 2048 })
    const commandByType = getCommandByType(commands);
    const commandList = getCommands(commandByType);
    const commandsMessage = `${Object.values(commandList).map(command => `\`${command.name}\`: \`${command.description}\``).join('\n')}`


    send({embeds: [createHelpEmbed(commandsMessage, embedColor, botIcon)]});
}

export default command;