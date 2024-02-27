import { SlashCommandBuilder } from "discord.js";
import { createInfoEmbed } from "../../embeds/index.js";


const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all the commands and their descriptions')
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
    
    const helpTitle = 'List of commands 🔍'
    const botIcon = countVonCount.displayAvatarURL({ dynamic: true, size: 2048 })
    const helpDescription = `**Here is a list of all commands available and their descriptions**`
    const helpFieldName = '**Commands**'
    const helpFieldValue = `${commands.map(command => `\`${command.name}\`: \`${command.description}\``).join('\n')}`

    send({embeds: [createInfoEmbed(helpTitle, helpDescription, helpFieldName, helpFieldValue, embedColor, botIcon)]});
}

export default command;