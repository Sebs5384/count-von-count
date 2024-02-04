import { SlashCommandBuilder } from "discord.js";
import { TrackerChannel, Boss } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('setmvp')
    .setDescription('Configures the MVP characteristics')
    .addStringOption((option) => option
        .setName('name')
        .setDescription('Input the name of the MVP')
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('downtime')
        .setDescription('Input the downtime of the MVP in minutes')
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('spawn-window')
        .setDescription('Input the spawn window of the MVP in minutes')
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('map')
        .setDescription('Input the name of the map with the following format e.g prt_fild01')
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('emoji')
        .setDescription('This is not required but you can input an emoji for the MVP')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(0);
command.aliases = ['setmvp, smvp, sm'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild
    const bossName = interaction.options.getString('name');
    const bossDowntime = interaction.options.getInteger('downtime');
    const bossSpawnWindow = interaction.options.getInteger('spawn-window');
    const bossMap = interaction.options.getString('map');
    const bossEmoji = interaction.options.getString('emoji');

    await runCommand(client, send, guild, bossName, bossDowntime, bossSpawnWindow, bossMap, bossEmoji);
}

async function runCommand(client, send, guild, bossName, bossDowntime, bossSpawnWindow, bossMap, bossEmoji) {

    const existingPermaTrackerChannel = await TrackerChannel.findOne({
        where: { guild_id: guild.id }
    })

    if(existingPermaTrackerChannel) {
        await Boss.findOrCreate({
            where: {
                boss_map: bossMap
            },
            defaults: {
                boss_name: bossName,
                boss_downtime: bossDowntime,
                boss_spawn_window: bossSpawnWindow,
                boss_map: bossMap,
                boss_emoji: bossEmoji,
                guild_id: guild.id
            }
        })
    } else {
        send(`The guild master must set the tracker channels first`)
    }
}

export default command;