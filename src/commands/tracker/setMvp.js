import { SlashCommandBuilder } from "discord.js";
import { isValidBossNameFormat, isValidMapNameFormat } from "../../utils/general.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel, Boss } from "../../models/index.js";
import { operator } from "../../../database.js";

const command = new SlashCommandBuilder()
    .setName('setmvp')
    .setDescription('Configures the MVP characteristics')
    .addStringOption((option) => option
        .setName('name')
        .setDescription('Input the name of the MVP')
        .setMaxLength(30)
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('downtime')
        .setDescription('Input the downtime of the MVP in minutes')
        .setMinValue(1)
        .setMaxValue(1440)
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('spawn-window')
        .setDescription('Input the spawn window of the MVP in minutes')
        .setMinValue(0)
        .setMaxValue(1440)
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
    );
command.aliases = ['setmvp, smvp, sm'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild
    const embedColor = client.config.embedColor
    const bossName = interaction.options.getString('name');
    const bossDowntime = interaction.options.getInteger('downtime');
    const bossSpawnWindow = interaction.options.getInteger('spawn-window');
    const bossMap = interaction.options.getString('map');
    const bossEmoji = interaction.options.getString('emoji');

    await runCommand(embedColor, send, guild, bossName, bossDowntime, bossSpawnWindow, bossMap, bossEmoji);
}

async function runCommand(embedColor, send, guild, bossName, bossDowntime, bossSpawnWindow, bossMap, bossEmoji) {

    const isValidBossName = isValidBossNameFormat(bossName)
    const isValidMapName = isValidMapNameFormat(bossMap)

    if(isValidBossName && isValidMapName) {
        try{
            const trackerChannel = await TrackerChannel.findOne({
                where: { guild_id: guild.id }
            })
        
            const existingBoss = await Boss.findOne({
                where: { 
                    guild_id: trackerChannel.guild_id, 
                    boss_name: {
                        [operator.like]: bossName
                    }
                },
                collate: 'NOCASE'
            });

            if(existingBoss) {
                
                const existingBossTitle = `The MVP already exists`
                const existingBossMessage = `${bossName} already exists in the tracker list as: ${existingBoss.boss_name}`
                const existingBossFooterMessage = `If you wish to manage this MVP please check out /mvphelp`

                send({ embeds: [createMessageEmbed(existingBossTitle, existingBossMessage, embedColor, '❌', existingBossFooterMessage)] })
            } else {
                const [createdBoss, created] = await Boss.findOrCreate({
                    where: { guild_id: trackerChannel.guild_id, boss_name: bossName },
                    defaults: {
                        boss_name: bossName,
                        boss_downtime: bossDowntime,
                        boss_spawn_window: bossSpawnWindow,
                        boss_map: bossMap,
                        boss_emoji: bossEmoji
                    }
                })
    
                const bossCreatedTitle = `The MVP has been created successfully`
                const bossCreatedMessage = `${bossName} has been added to the tracker list`
                const bossCreatedFooterMessage = `If you wish to manage this MVP please check out /mvphelp`
                
                if(created) {
                    await send({ embeds: [createMessageEmbed(bossCreatedTitle, bossCreatedMessage, embedColor, '✅', bossCreatedFooterMessage)] })
                } else {
                    const errorBossTitle = `Error while creating the MVP`
                    const errorBossMessage = `There was an error while creating this entry for ${bossName}`
                    const errorBossFooterMessage = `If you wish to manage this MVP please check out /mvphelp`

                    await send({ embeds: [createMessageEmbed(errorBossTitle, errorBossMessage, embedColor, '❌', errorBossFooterMessage)] })
                };
            };
        } catch (error) {
            console.error(`There was an error while executing this command: ${error}`);
        }
    } else {
        const invalidMessageTitle = `Invalid values provided`
        const invalidMessageAndMapNameMessage = `Invalid boss name and map name \n Reading: ${bossName} and ${bossMap}`;
        const invalidBossNameMessage = `Invalid boss name \n Reading: ${bossName}`;
        const invalidMapNameMessage = `Invalid map name \n Reading: ${bossMap}`;
        const invalidMessageFooterMessage = `Mvp names should be alphanumeric and map names should be in the following format e.g prt_fild01 or prt01`

        !isValidBossName && !isValidMapName
            ? send({ embeds: [createMessageEmbed(invalidMessageTitle, invalidMessageAndMapNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
            : !isValidBossName
            ? send({ embeds: [createMessageEmbed(invalidMessageTitle, invalidBossNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
            : !isValidMapName
            ? send({ embeds: [createMessageEmbed(invalidMessageTitle, invalidMapNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
        : null;
    }

}

export default command;