import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { getCategoryValues } from "../../utils/general.js";
import { createSelectCategoryRow } from "../../rows/index.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { Race, RaceChannel } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('setracechannel')
    .setDescription('Set the category where race channels will be created')
    .setDefaultMemberPermissions(0);
command.aliases = ['configrace, crace'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;
    const userId = interaction.user.id;
    const botId = client.config.botId;
    const guildCategory = ChannelType.GuildCategory;

    await runCommand(client, guild, send, interaction, embedColor, guildCategory, userId, botId);
};

async function runCommand(client, guild, send, interaction, embedColor, guildCategory, userId, botId) {
    const categoryValues = await getCategoryValues(guild, guildCategory);
    const rows = createSelectCategoryRow(categoryValues);

    try {
        const selectCategoryTitle = 'Select the category where the race-channel will be displayed';
        const selectCategoryMessage = 'Below is the list of categories in your discord channel';
        const selectCateogryMessageFooter = 'This message will automatically be dismissed in 1 minute';

        const message = await send({ embeds: [createMessageEmbed(selectCategoryTitle, selectCategoryMessage, embedColor, '🤖', selectCateogryMessageFooter)], components: [rows] });
        const selectedCategoryFilter = i => i.customId === 'selectcategory' && i.user.id === userId;
        const ONE_MINUTE = 60000;

        const collector = interaction.channel.createMessageComponentCollector({ filter: selectedCategoryFilter, time: ONE_MINUTE });

        collector.on('collect', async (selectInteraction) => {
            
            const selectedValue = selectInteraction.values;
            const category = await guild.channels.cache.get(selectedValue[0]);
            let raceChannel, permaRaceChannel;

            const existingRaceChannel = await RaceChannel.findOne({
                where: { 
                    guild_id: guild.id 
                },
            });

            if(existingRaceChannel) {
                const permaRaceChannelId = existingRaceChannel.perma_race_channel_id;
                const raceChannelId = existingRaceChannel.race_channel_id;

                try {
                    permaRaceChannel = await client.channels.fetch(permaRaceChannelId);
                    raceChannel = await client.channels.fetch(raceChannelId);

                    if(permaRaceChannel && raceChannel) {

                        await permaRaceChannel.edit({parent: category});
                        await raceChannel.edit({parent: category});
                    };
                } catch(error) {

                    permaRaceChannel = await createPermaRaceChannel(guild, category, botId);
                    raceChannel = await createRaceChannel(guild, category, botId);
                };

                await existingRaceChannel.update({
                    perma_race_channel_id: permaRaceChannel.id,
                    race_channel_id: raceChannel.id,
                    category_name: category.name,
                    guild_category_id: category.id
                });

                const raceChannelMessageTitle = 'Race channel has been updated';
                const raceChannelMessage = 'Please set race time using /setrace command';

                const editedMessageTitle = 'Successfully updated race channel';
                const editedMessageContent = `Perma-race-channel has been updated in the <#${selectedValue}> category`;

                await raceChannel.send({ embeds: [createMessageEmbed(raceChannelMessageTitle, raceChannelMessage, embedColor, '✅')] });
                await message.edit({ embeds: [createMessageEmbed(editedMessageTitle, editedMessageContent, embedColor, '✅')], components: [] });
                collector.stop();
            
            } else {
                permaRaceChannel = await createPermaRaceChannel(guild, category, botId);
                raceChannel = await createRaceChannel(guild, category, botId);

                const [createdRaceChannel] = await RaceChannel.findOrCreate({
                    where: { guild_id: guild.id },
                    defaults: {
                        perma_race_channel_id: permaRaceChannel.id,
                        race_channel_id: raceChannel.id,
                        category_name: category.name,
                        guild_category_id: category.id
                    },
                });

                if(createdRaceChannel) {
                    const raceChannelMessageTitle = 'Race channel has been created';
                    const raceChannelMessage = 'Please set race time using /setrace command';

                    const editedMessageTitle = 'Successfully created race channel';
                    const editedMessageContent = `Perma-race channel has been created in the <#${selectedValue}> category`;

                    const serverTimeZone = 'America/Los_Angeles';
                    const serverTime = getServerTime(serverTimeZone);
                    const raceTimerFooter = `This timer auto updates every minute, last updated at: ${serverTime.time} Server Time`;

                    await permaRaceChannel.send({ embeds: [createMessageEmbed('Race Timer', `Next race will happen in 2`, embedColor, '🏁', raceTimerFooter)] });
                    await raceChannel.send({ embeds: [createMessageEmbed(raceChannelMessageTitle, raceChannelMessage, embedColor, '✅')] });
                    await message.edit({ embeds: [createMessageEmbed(editedMessageTitle, editedMessageContent, embedColor, '✅')], components: [] });
                    collector.stop();
                } else {
                    const errorTitle = 'Error updating tracker channel';
                    const errorMessage = 'Something went wrong, please try again';

                    await message.edit({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌')], components: [] });
                };
            };
        });

        collector.on('end', (collected, reason) => {
            const timeUpTittle = 'Time is up';
            const timeUpMessage = "You didn't select any category in time, please try again";

            if(reason === 'time') {
                try {
                    message.edit({ embeds: [createMessageEmbed(timeUpTittle, timeUpMessage, embedColor, '❗')], components: [] });
                } catch(error) {
                    console.error(`Error editing message: ${error}`);
                };
            };
        });

    } catch (error) {
        console.log(`Error setting perma-race channel: ${error}`);
    };
};

async function createPermaRaceChannel(guild, category, botId) {
    const permaRaceChannel = await guild.channels.create({
        name: 'perma-race',
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

    return permaRaceChannel;
};

async function createRaceChannel(guild, category) {
    const raceChannel = await guild.channels.create({
        name: 'race',
        type: ChannelType.GuildText,
        parent: category.id,
    });

    return raceChannel;
};

export default command;