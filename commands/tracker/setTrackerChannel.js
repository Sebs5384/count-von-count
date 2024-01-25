import { ChannelType, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";

const command = new SlashCommandBuilder()
    .setName('settrackerchannel')
    .setDescription('Sets the channel where the perma-tracker will be display')
    .setDefaultMemberPermissions(0)
command.aliases = ['configtracker, ctracker'];

command.slashRun = async function slashRun(client, interaction) {

};

export default command;