import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel, Boss } from "../../models/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { getMapLocation } from "../../service/locate.js"
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
        .setName('estimate')
        .setDescription('Input the estimate of the kill in minutes e.g 10 to add and -10 to subtract time, optional field')
        .setRequired(false)
    )
    .addIntegerOption((option) => option
        .setName('tomb-x')
        .setDescription('Input X cordinate of the tomb, optional field')
        .setRequired(false)
    )
    .addIntegerOption((option) => option
        .setName('tomb-y')
        .setDescription('Input Y cordinate of the tomb, optional field')
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
    const mvpEstimate = interaction.options.getInteger('estimate');
    const tombX = interaction.options.getInteger('tomb-x');
    const tombY = interaction.options.getInteger('tomb-y');

    await runCommand(send, guild, user, embedColor, mvpName, mvpEstimate, tombX, tombY, serverTime, interactionChannelId);
};

async function runCommand(send, guild, user, embedColor, mvpName, mvpEstimate, tombX, tombY, serverTime, interactionChannelId) {
    try {
        const trackerChannel = await TrackerChannel.findOne({
            where: { 
                guild_id: guild.id 
            },
        });
        
        if(!trackerChannel) {
            await send({ embeds: [
                createMessageEmbed(
                    'No tracker channel found',
                    'Please configure the tracker channel first by using /settrackerchannel command',
                    'For more information use /mvphelp'
                )
            ]})

            return;
        };

        if(interactionChannelId !== trackerChannel.dataValues.tracker_channel_id) {
            await send({ embeds: [
                createMessageEmbed(
                    'Wrong usage of command', 
                    'This command is only available in the tracker channel', 
                    embedColor, 
                    '❌'
                )
            ]});

            return;
        };

        const boss = await Boss.findOne({
            where: { 
                guild_id: guild.id, 
                    [operator.or]: [{
                        boss_name: {
                            [operator.like]: mvpName
                        }
                    },
                    {
                        id: {
                        [operator.in]: literal(
                            `(SELECT boss_id FROM BossAliases WHERE boss_alias LIKE '${mvpName}')`
                        )}
                    },
                    ]},
            collate: 'NOCASE'
        });

        if(!boss) {
            await send({ embeds: [
                createMessageEmbed(
                    'No boss found', 
                    `Could not find ${mvpName} in the database`, 
                    embedColor, 
                    '❌'
                )
            ]});
            
            return;
        };

        if(mvpEstimate) {
            const bossKilledAtTimestamp = new Date(boss.boss_killed_at);
            const mvpKilledAtInMilliseconds = bossKilledAtTimestamp.getTime() + (mvpEstimate * 60 * 1000);
            const updatedDateWhenKilled = new Date(mvpKilledAtInMilliseconds);
            const updatedDateTime = updatedDateWhenKilled.toISOString();
            const updatedTime = `${updatedDateWhenKilled.getHours()}:${updatedDateWhenKilled.getMinutes().toString().padStart(2, '0')}`;
                
            serverTime.time = updatedTime;
            serverTime.dateTime = updatedDateTime;
        };

        if(boss) {
            const updatedBoss = await boss.update({
                boss_killed_at: serverTime.dateTime
            });
            const mapResponse = await getMapLocation(tombX, tombY, boss.boss_map);

            send({ embeds: [
                createMessageEmbed(
                    'MvP Tracker', 
                    `${updatedBoss.boss_name} died at ${serverTime.time}\nTracked by ${user}\n\n${mapResponse ? `***Tomb location: ${boss.boss_map} - ${tombX}/${tombY}***` : tombX && tombY ? `***No map has been found for this MVP, reading: ${boss.boss_map}***` : ''}`, 
                    embedColor, 
                    '✅', 
                    'For more information use /mvphelp',
                    null,
                    null,
                    boss.boss_map ? mapResponse?.locationUrl : null
                )
            ]});

            return;
        };  
    } catch (error) {
        console.log(`Error while tracking the boss ${error}`);
        send({ embeds: [
            createMessageEmbed(
                'Tracker error', 
                'Something went wrong while tracking the boss', 
                embedColor, 
                '❌', 
                'Check /mvphelp for more information'
            )
        ]});

        return;
    };
};

export default command;