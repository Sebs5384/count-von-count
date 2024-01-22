import { SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all the commands and descriptions');
command.aliases = ['h', 'commands', 'cmds'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);

    await runCommand(client, guild, send);
}

async function runCommand(client, guild, send) {
    console.log(client.commands.map(command => command));


    send('help')
}

export default command;