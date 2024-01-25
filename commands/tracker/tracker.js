import { SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
    .setName('tracker')
    .setDescription('Displays the list of MVPs that are currently tracked')
    .setDefaultMemberPermissions(0);
command.aliases = ['t, tracker'];

command.slashRun = async function slashRun(client, interaction ) {
    console.log("hello mars")
}

export default command;