import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createTrackerEmbed } from "../../embeds/index.js";
import { Boss, TrackerChannel } from "../../models/index.js";
import { formatToClockHour } from "../../utils/general.js";

const command = new SlashCommandBuilder()
    .setName('tracker')
    .setDescription('Displays the list of MVPs that are currently tracked')
    .setDefaultMemberPermissions(0);
command.aliases = ['t, tracker', 'mvps', 'bosses'];

command.slashRun = async function slashRun(client, interaction ) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;

    const trackerChannelWithBosses = await TrackerChannel.findAll({
        where: { guild_id: guild.id },
        include: [{
            model: Boss,
        }]
    });

    const bosses = trackerChannelWithBosses.flatMap((trackerChannel) => trackerChannel.Bosses.map((boss) => boss.dataValues));
    const guildBosses = [];
    for(const boss of bosses) {
        const mvp = {
            name: boss.boss_name,
            map: boss.boss_map,
            downtime: boss.boss_downtime,
            spawnWindow: boss.boss_spawn_window,
            emoji: boss.boss_emoji,
            killed: boss.boss_killed_at
        }

        guildBosses.push(mvp);
    }

    const mvpTimers = guildBosses.map((boss) => {
        const bossDownTime = Number(boss.downtime);
        const bossSpawnWindow = Number(boss.spawnWindow);
        const bossKilledAt = boss.killed;

        const totalMinutesSinceKilled = getTotalMinutesSinceKilled(bossKilledAt);
        const totalMinutesTillRange = getMinutesTillRange(bossDownTime, totalMinutesSinceKilled);
        const nextRange = formatToClockHour(totalMinutesTillRange);
        const bossRange = getBossRange(totalMinutesSinceKilled + 424, totalMinutesTillRange, bossSpawnWindow);
        const bossField = getBossField(boss, bossRange);

        return bossField;
    })

    await send({ embeds: [createTrackerEmbed(mvpTimers, embedColor)] });        

        

}

function getBossField(boss, bossRange) {
    
    let downTimeHours = bossRange.remainingDownTimeInHours;
    let downTimeMinutes = bossRange.remainingDownTimeInMinutes;
    let spawnWindowHours = bossRange.remainingTimeTillSpawnInHours;
    let spawnWindowMinutes = bossRange.remainingTimeTillSpawnInMinutes;


}

function getTotalMinutesSinceKilled(bossKilledAt) {
    const [hours, minutes] = bossKilledAt.split(':').map((time) => Number(time));
    const totalMinutesSinceKilled = hours * 60 + minutes

    return totalMinutesSinceKilled
}

function getMinutesTillRange(bossDownTime, totalMinutesSinceKilled) {
    const totalMinutesTillRange = totalMinutesSinceKilled + bossDownTime;
    
    return totalMinutesTillRange;
}

function getBossRange(totalMinutesSinceKilled, totalMinutesTillRange, bossSpawnWindow) {
    const bossRemainingDownTime = totalMinutesTillRange - totalMinutesSinceKilled;
    const bossRemainingTimeTillSpawn = (bossSpawnWindow + totalMinutesTillRange) - totalMinutesSinceKilled;

    const remainingDownTimeInHours = Math.floor(bossRemainingDownTime / 60);
    const remainingDownTimeInMinutes = bossRemainingDownTime % 60;

    const remainingTimeTillSpawnInHours = Math.floor(bossRemainingTimeTillSpawn / 60);
    const remainingTimeTillSpawnInMinutes = bossRemainingTimeTillSpawn % 60;

    const bossRange = {
        remainingDownTimeInHours,
        remainingDownTimeInMinutes,
        remainingTimeTillSpawnInHours,
        remainingTimeTillSpawnInMinutes
    }

    return bossRange
}


export default command;