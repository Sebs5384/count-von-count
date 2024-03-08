import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel, Boss } from "../../models/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { getTotalMinutesFromDate } from "../../utils/general.js";
import { operator } from "../../../database.js";

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
command.aliases = ['t', 'track'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;

    const serverTimeZone = 'America/Los_Angeles';
    let serverTime = await getServerTime(serverTimeZone);

    const mvpName = interaction.options.getString('mvp-name');
    const mvpStimate = interaction.options.getInteger('stimate');
    const mvpHelpMessage = 'For more information use /mvphelp';

    const boss = await Boss.findOne({
        where: { 
            guild_id: guild.id, 
            boss_name: {
                [operator.like]: mvpName
            }
        },
        collate: 'NOCASE'
    });

    if(mvpStimate) {

        const bossKilledAtTimestamp = new Date(boss.boss_killed_at);
        const totalMinutesWhenKilled = getTotalMinutesFromDate(bossKilledAtTimestamp);
        const mvpKilledAtInMilliseconds = bossKilledAtTimestamp.getTime() + (mvpStimate * 60 * 1000);
        const updatedDateWhenKilled = new Date(mvpKilledAtInMilliseconds);
        const updatedTime = `${updatedDateWhenKilled.getHours()}:${updatedDateWhenKilled.getMinutes().toString().padStart(2, '0')}`;
        
        serverTime.time = updatedTime;
        serverTime.dateTime = updatedDateWhenKilled.toISOString();
    };

    await runCommand(send, guild, embedColor, boss, mvpName, serverTime, mvpHelpMessage);
};

async function runCommand(send, guild, embedColor, boss, mvpName, serverTime, footer){
    const trackerChannel = await TrackerChannel.findOne({
        where: { guild_id: guild.id },
    });

    if(trackerChannel) {

        if(boss) {
            const updatedBoss = await boss.update({
                boss_killed_at: serverTime.dateTime
            });
    
            const trackerTitle = 'MvP Tracker';
            const trackerMessage = `${updatedBoss.boss_name} died at ${serverTime.time}`;
                
            send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '✅', footer)] });
        } else {
            const trackerTitle = 'No MvP found';
            const trackerMessage = `This mvp is not found in the tracker list, reading: ${mvpName}`;
            
            send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '❌', footer)] });
        };
    };
};

export default command;