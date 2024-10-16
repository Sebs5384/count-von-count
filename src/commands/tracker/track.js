import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel, Boss, BossAlias } from "../../models/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { getTotalMinutesFromDate } from "../../utils/general.js";
import { operator, literal } from "../../../database.js";

const command = new SlashCommandBuilder()
    .setName('track')
    .setDescription('Tracks an MVP')
    .addStringOption((option) => option
        .setName('mvp-name')
        .setDescription('Input the name of the MVP you want to track e.g Kraken, required field')
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('stimate')
        .setDescription('Input the stimate of the kill in minutes e.g 10 to add and -10 to subtract time, optional field')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('tomb')
        .setDescription('Input the location of the tomb, optional field')
        .setRequired(false)
    )
command.aliases = ['t', 'track'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const user = interaction.user;
    const embedColor = client.config.embedColor;
    const interactionChannelId = interaction.channelId;

    const serverTimeZone = 'America/Los_Angeles';
    let serverTime = await getServerTime(serverTimeZone);

    const mvpName = interaction.options.getString('mvp-name');
    const mvpStimate = interaction.options.getInteger('stimate');
    const mvpTomb = interaction.options.getString('tomb');

    await runCommand(send, guild, user, embedColor, mvpName, mvpStimate, mvpTomb, serverTime, interactionChannelId);
};

async function runCommand(send, guild, user, embedColor, mvpName, mvpStimate, mvpTomb, serverTime, interactionChannelId) {
    const trackerChannel = await TrackerChannel.findOne({
        where: { 
            guild_id: guild.id 
        },
    });

    if(interactionChannelId !== trackerChannel.dataValues.tracker_channel_id) {
        await send({ embeds: [createMessageEmbed('Wrong usage of command', 'This command is only available in the tracker channel', embedColor, '❌')] });
        return;
    };

    if(trackerChannel) {

        try {
        
            const boss = await Boss.findOne({
                where: { 
                    guild_id: guild.id, 
                    [operator.or]: [
                        {
                            boss_name: {
                                [operator.like]: mvpName
                            }
                        },
                        {
                            id: {
                                [operator.in]: literal(
                                    `(SELECT boss_id FROM BossAliases WHERE boss_alias LIKE '${mvpName}')`
                                )
                            }
                        }
                    ]
                },
                collate: 'NOCASE'
            }); 
    

            if(mvpStimate) {
        
                const bossKilledAtTimestamp = new Date(boss.boss_killed_at);
                const mvpKilledAtInMilliseconds = bossKilledAtTimestamp.getTime() + (mvpStimate * 60 * 1000);
                const updatedDateWhenKilled = new Date(mvpKilledAtInMilliseconds);
                const updatedDateTime = updatedDateWhenKilled.toISOString();
                const updatedTime = `${updatedDateWhenKilled.getHours()}:${updatedDateWhenKilled.getMinutes().toString().padStart(2, '0')}`;
                
                serverTime.time = updatedTime;
                serverTime.dateTime = updatedDateTime;
            };
        
            const mvpHelpMessage = 'For more information use /mvphelp';
        
            if(boss) {
                const updatedBoss = await boss.update({
                    boss_killed_at: serverTime.dateTime
                });
            
                const trackerTitle = 'MvP Tracker';
                const trackerMessage = `${updatedBoss.boss_name} died at ${serverTime.time}${mvpTomb ? `\nLocation: ${mvpTomb}` : ''}\n Tracked by ${user}`;
                        
                send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '✅', mvpHelpMessage)] });
            } else {
                const trackerTitle = 'No MvP found';
                const trackerMessage = `This mvp is not found in the tracker list, reading: ${mvpName}`;
                    
                send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '❌', mvpHelpMessage)] });
            };
            
        } catch (error) {
            console.log(`Error while tracking the boss ${error}`);

            const errorTitle = 'Error while tracking the boss';
            const errorMessage = `There was an error while tracking ${mvpName}`;
            const errorFooter = 'Check /mvphelp for more information';
        
            send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
        }
        
    } else {
        const noTrackerChannelTitle = 'No tracker channel found';
        const noTrackerMessage = 'Please configure the tracker channel first';
        const noTrackerFooter = 'Use /settrackerchannel to create your own tracker channel';

        await send({ embeds: [createMessageEmbed(noTrackerChannelTitle, noTrackerMessage, embedColor, '❌', noTrackerFooter)] });
    };

};

export default command;