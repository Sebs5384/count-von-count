import { SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
    .setName('track')
    .setDescription('Tracks an MVP')
    .setDefaultMemberPermissions(0);
command.aliases = ['t', 'track'];

command.slashRun = async function slashRun(client, interaction) {
    console.log("Hello jupiter")
};

export default command;