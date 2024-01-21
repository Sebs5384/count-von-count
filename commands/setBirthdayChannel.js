import { ChannelType, SlashCommandBuilder } from "discord.js";
import { BirthdayChannel, Guild } from "../models/index.js";

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


    try {
        const [guild, createdGuild] = await Guild.findOrCreate({
            where: { guild_id: interaction.guild.id },
            defaults: { guild_name: interaction.guild.name, guild_master: interaction.guild.ownerId },
            upsert: true
        });
        
        const existingChannel = await BirthdayChannel.findOne({ where: { guild_id: guild.guild_id }});
    
        if(existingChannel) {

            console.log(channel.id);
            await existingChannel.update({
                birthday_channel: channel.id,
                channel_name: channel.name,
            });
    
            await send(`Successfully updated the birthday channel to ${channel}`);
        } else {
            const [createdChannel, created] = await BirthdayChannel.findOrCreate({
                where: { guild_id: guild.guild_id },
                defaults: { channel_name: channel.name, birthday_channel: channel.id },
            })
            await send(`Successfully set the birthday channel to ${channel}`);
        }
     
    } catch (error) {
        console.log(error);
    }
 

}

export default command;