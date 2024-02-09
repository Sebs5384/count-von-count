import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { getCategoryValues } from "../../utils/general.js";
import { createSelectCategoryRow } from "../../rows/index.js";
import { createTrackerEmbed, createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('settrackerchannel')
    .setDescription('Sets the channel where the perma-tracker will be display')
    .setDefaultMemberPermissions(0);
command.aliases = ['configtracker, ctracker'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;
    const userId = interaction.user.id;
    const botId = client.config.botId;
    const guildCategory = ChannelType.GuildCategory;

    await runCommand(guild, send, interaction, embedColor, guildCategory, userId, botId);
};


async function runCommand(guild, send, interaction, embedColor, guildCategory, userId, botId) {
    const categoryValues = await getCategoryValues(guild, guildCategory);
    const rows = createSelectCategoryRow(categoryValues);


    try {
        const selectCategoryTitle = "Select the category where the perma-tracker will be displayed";
        const selectCategoryMessage = "Below is the list of categories in your discord channel"
        const message = await send({ embeds: [createMessageEmbed(selectCategoryTitle, selectCategoryMessage, embedColor, '🤖')], components: [rows] });
        const selectedCategoryFilter = i => i.customId === 'selectcategory' && i.user.id === userId;
        const ONE_MINUTE = 600000;
    
        const collector = interaction.channel.createMessageComponentCollector({ selectedCategoryFilter, time: ONE_MINUTE });

        collector.on('collect', async (selectInteraction) => {
        
            const selectedValue = selectInteraction.values;
            const category = await guild.channels.cache.get(selectedValue[0]);
            let trackerChannel, permaTrackerChannel;

            const existingTrackerChannel = await TrackerChannel.findOne({
                where: { guild_id: guild.id },
            })

            if(existingTrackerChannel) {
                permaTrackerChannel = await guild.channels.cache.get(existingTrackerChannel.perma_tracker_channel_id);
                trackerChannel = await guild.channels.cache.get(existingTrackerChannel.tracker_channel_id);
                
                if(permaTrackerChannel && trackerChannel) {
                    await permaTrackerChannel.edit({parent: category});
                    await trackerChannel.edit({parent: category});      
                } else {
                    permaTrackerChannel = await createPermaTrackerChannel(guild, category, botId);
                    trackerChannel = await createTrackerChannel(guild, category);
                }
              
                await existingTrackerChannel.update({
                    perma_tracker_channel_id: permaTrackerChannel.id,
                    tracker_channel_id: trackerChannel.id,
                    category_name: category.name,
                    guild_category_id: category.id        
                })

                const trackerMessageTitle = "Tracker channel has been updated"
                const trackerMessage = "Please set mvps by using /setmvp command"
                const editedMessageTitle = 'Succesfully updated tracker channel'
                const editedMessageContent = `Perma-tracker channel has been updated in the <#${selectedValue}> category`

                await trackerChannel.send({ embeds: [createMessageEmbed(trackerMessageTitle, trackerMessage, embedColor, '✅')] });
                await message.edit({ embeds: [createMessageEmbed(editedMessageTitle, editedMessageContent, embedColor, '✅')], components: [] });
                collector.stop();
            } else {
                permaTrackerChannel = await createPermaTrackerChannel(guild, category, botId);
                trackerChannel = await createTrackerChannel(guild, category);

                const [createdTrackerChannel] = await TrackerChannel.findOrCreate({
                    where: { guild_id: guild.id },
                    defaults: { perma_tracker_channel_id: permaTrackerChannel.id, tracker_channel_id: trackerChannel.id, category_name: category.name, guild_category_id: category.id },
                });
        
                if(createdTrackerChannel){
                    const trackerMessageTitle = "Tracker channel has been created"
                    const trackerMessage = "Please set mvps by using /setmvp command"
                    const editedMessageTitle = 'Succesfully settled perma-tracker channel'
                    const editedMessageContent = `Perma-tracker channel has been created in the <#${selectedValue}> category`
    
                    await permaTrackerChannel.send({ embeds: [createTrackerEmbed(embedColor)] });
                    await trackerChannel.send({ embeds: [createMessageEmbed(trackerMessageTitle, trackerMessage, embedColor, '✅')] });
                    await message.edit({ embeds: [createMessageEmbed(editedMessageTitle, editedMessageContent, embedColor, '✅')], components: [] });
                    collector.stop();
                } else {
                    const errorTitle = 'Error updating tracker channel'
                    const errorMessage = 'Something went wrong, please try again'
    
                    await message.edit({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌')], components: [] });
                }   
            }
        });
    
        collector.on('end', (collected, reason) => {
            const timeUpMessage = "Time is up for selecting, try using /settrackerchannel command again."
    
            if(reason === 'time') {
                message.edit({ content: timeUpMessage, components: [] });
            };
        });

    } catch (error) {
        console.error(`Error setting perma-tracker channel : ${error}`);
    }
}

async function createPermaTrackerChannel(guild, category, botId){
    const permaTrackerChannel = await guild.channels.create({
        name: 'perma-tracker',
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: PermissionsBitField.Flags.SendMessages,
            },
            {
                id: botId,
                allow: PermissionsBitField.Flags.SendMessages,
            }
        ]
    });

    return permaTrackerChannel;
}

async function createTrackerChannel(guild, category) {
    const trackerChannel = await guild.channels.create({
        name: 'tracker',
        type: ChannelType.GuildText,
        parent: category.id,       
    });

    return trackerChannel;
}

export default command;