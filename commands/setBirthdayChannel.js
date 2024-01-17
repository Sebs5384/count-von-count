import { ChannelType, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
    .setName('setbirthdaychannel')
    .setDescription('Sets the channel where the birthday message will be sent')
    .addChannelOption((option) => option
        .setName('channel')
        .setDescription('Input the channel where the birthday message will be sent')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true));
command.aliases = ['configbday, cbday'];

command.slashRun = async function slashRun(client, interaction) {

    const send = interaction.followUp.bind(interaction);
    const channel = interaction.options.getChannel('channel');

    await send(`Successfully set the birthday channel to ${channel}`);
}

export default command;