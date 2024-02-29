import { SlashCommandBuilder } from "discord.js"
import { createMessageEmbed } from "../../embeds/index.js";
import { isValidBossNameFormat, isValidMapNameFormat } from "../../utils/general.js";
import { TrackerChannel, Boss } from "../../models/index.js";
import { operator } from "../../../database.js";

const command = new SlashCommandBuilder()
    .setName('editmvp')
    .setDescription('Edits an MVP characteristics')
    .addStringOption((option) => option
        .setName('current-name')
        .setDescription('Input the current name of the MVP to be edited e.g Kraken, required field')
        .setMaxLength(30)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('new-name')
        .setDescription('Input the new name of the MVP e.g Kraken to Kraken2, optional field')
        .setMaxLength(30)
        .setRequired(false)
    )
    .addIntegerOption((option) => option
        .setName('new-downtime')
        .setDescription('Input the new downtime of the MVP in minutes e.g 100 (1:40HS), optional field')
        .setMinValue(1)
        .setMaxValue(1440)
        .setRequired(false)
    )
    .addIntegerOption((option) => option
        .setName('new-spawn-window')
        .setDescription('Input the new spawn window of the MVP in minutes e.g 70 (1:10HS), optional field')
        .setMinValue(0)
        .setMaxValue(1440)
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('new-map')
        .setDescription('Input the new map of the MVP e.g iz_dun05, geffenia, abbey03, optional field')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('new-emoji')
        .setDescription('Input the new emoji of the MVP e.g 🐙, optional field')
        .setRequired(false)
    );
command.aliases = ['editmvp, emvp, em'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild
    const embedColor = client.config.embedColor

    const bossName = interaction.options.getString('current-name');
    const newBossName = interaction.options.getString('new-name');
    const newDowntime = interaction.options.getInteger('new-downtime');
    const newSpawnWindow = interaction.options.getInteger('new-spawn-window');
    const newMap = interaction.options.getString('new-map');
    const newEmoji = interaction.options.getString('new-emoji');

    await runCommand(embedColor, send, guild, bossName, newBossName, newDowntime, newSpawnWindow, newMap, newEmoji);
};

async function runCommand(embedColor, send, guild, bossName, newBossName, newDowntime, newSpawnWindow, newMap, newEmoji) {
    const isValidBossName = isValidBossNameFormat(newBossName);
    const isValidMapName = isValidMapNameFormat(newMap);

    if(isValidBossName && isValidMapName) {
        try {
            const trackerChannel = await TrackerChannel.findOne({
                where: { guild_id: guild.id }
            });

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
                const oldFields = {
                    boss_name: existingBoss.boss_name,
                    boss_downtime: existingBoss.boss_downtime,
                    boss_spawn_window: existingBoss.boss_spawn_window,
                    boss_map: existingBoss.boss_map,
                    boss_emoji: existingBoss.boss_emoji
                }

                const updatedFields = {};

                newBossName ? updatedFields.boss_name = newBossName : null;
                newDowntime ? updatedFields.boss_downtime = newDowntime : null;
                newSpawnWindow ? updatedFields.boss_spawn_window = newSpawnWindow : null;
                newMap ? updatedFields.boss_map = newMap : null;
                newEmoji ? updatedFields.boss_emoji = newEmoji : null;
                
                await existingBoss.update(updatedFields);
                
                const editMvpTitle = 'MVP Edited Successfully';
                const editMvpMessage = getChangedBossValues(oldFields, updatedFields);
                const editMvpFooterMessage = 'Check /mvphelp for more information.'

                await send({ embeds: [createMessageEmbed(editMvpTitle, editMvpMessage, embedColor, '✅', editMvpFooterMessage)] });
            } else {
                const unknownBossNameTitle = 'Unknown MVP Name';
                const unknownBossNameMessage = `The boss ${bossName} does not exist in the tracker list.`;
                const unknownBossNameFooterMessage = 'Check /mvphelp for more information.'

                await send({ embeds: [createMessageEmbed(unknownBossNameTitle, unknownBossNameMessage, embedColor, '❌', unknownBossNameFooterMessage)]});
            }

        } catch (error) {

        };
    } else {
        const invalidMessageTitle = `Invalid values provided`
        const invalidMessageAndMapNameMessage = `Invalid boss name and map name \n Reading: ${newBossName} and ${newBossMap}`;
        const invalidBossNameMessage = `Invalid boss name \n Reading: ${newBossName}`;
        const invalidMapNameMessage = `Invalid map name \n Reading: ${newBossMap}`;
        const invalidMessageFooterMessage = `Mvp names should be alphanumeric and map names should be in the following format e.g prt_fild01, prt01, prontera01`

        !isValidBossName && !isValidMapName
            ? send({ embeds: [createMessageEmbed(invalidMessageTitle, invalidMessageAndMapNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
            : !isValidBossName
            ? send({ embeds: [createMessageEmbed(invalidMessageTitle, invalidBossNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
            : !isValidMapName
            ? send({ embeds: [createMessageEmbed(invalidMessageTitle, invalidMapNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
        : null;
    }
};

function getChangedBossValues(oldFields, updatedFields) {
    return`
        The MVP has been edited 
        \n**Old values** 
        Previous Boss Name: ${oldFields.boss_name}
        Previous Downtime: ${oldFields.boss_downtime} minutes
        Previous Spawn Window: ${oldFields.boss_spawn_window} minutes
        Previous Map: ${oldFields.boss_map}
        Previous Emoji: ${oldFields.boss_emoji}     
        \n**New values** 
        New Boss Name: ${updatedFields.boss_name ? updatedFields.boss_name : oldFields.boss_name}
        New Downtime: ${updatedFields.boss_downtime ? updatedFields.boss_downtime : oldFields.boss_downtime} minutes
        New Spawn Window: ${updatedFields.boss_spawn_window ? updatedFields.boss_spawn_window : oldFields.boss_spawn_window} minutes
        New Map: ${updatedFields.boss_map ? updatedFields.boss_map : oldFields.boss_map}
        New Emoji: ${updatedFields.boss_emoji ? updatedFields.boss_emoji : oldFields.boss_emoji}
    `
}

export default command;