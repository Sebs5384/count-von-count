import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createTrackerEmbed } from "../../embeds/index.js";
import { Boss, TrackerChannel } from "../../models/index.js";
import { getBossTimers, formatBossesData } from "../../utils/general.js";
import { getServerTime } from "../../service/serverTime.js";

const command = new SlashCommandBuilder()
    .setName('tracker')
    .setDescription('Displays the list of MVPs that are currently tracked')
command.aliases = ['t, tracker', 'mvps', 'bosses'];

command.slashRun = async function slashRun(client, interaction, permaTrackerMessage, permaTrackerChannelId) {
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
    const hasBosses = bosses.length > 0
    
    const serverTimeZone = 'America/Los_Angeles';
    const serverTime = await getServerTime(serverTimeZone);
    const trackerFooter = `Tracker updates every minute, last updated at: ${serverTime.date} ${serverTime.time} Server Time \nCurrent Location: (${serverTimeZone.replace('_', ' ')})`;

    if(hasBosses) {
        const formattedBosses = formatBossesData(bosses);
        const bossTimers = getBossTimers(formattedBosses, serverTime);
        const updatedBossTimers = await Promise.all(bossTimers.map( async (boss) => {
            if(!boss) {
                return boss;
            }

            if(boss.bossToRemove) {
                await Boss.update(
                    { boss_killed_at: null },
                    { where: {
                        guild_id: guild.id,
                        boss_name: boss.bossToRemove
                    }}
                );

                return;
            } else {
                return boss;
            };
        }));
        const filteredBossTimers = updatedBossTimers.filter(field => field)
        const hasBossesTracked = bossTimers.length > 0;

        if(hasBossesTracked) {

            if(permaTrackerMessage && permaTrackerChannelId) {

                await permaTrackerMessage.edit({ embeds: [createTrackerEmbed(filteredBossTimers, trackerFooter, embedColor)] });
                return;
            }

            const bossList = await send({ embeds: [createTrackerEmbed(filteredBossTimers, trackerFooter, embedColor)] });
            return bossList;
        } else {

            const noBossesField = { name: 'No mvps currently tracked 🛑', value: 'Its quiet for now, go get some bosses !' }

            if(permaTrackerMessage && permaTrackerChannelId) {
                await permaTrackerMessage.edit({ embeds: [createTrackerEmbed(noBossesField, trackerFooter, embedColor)] });
                return;
            }
            
            const noBosses = await send({ embeds: [createTrackerEmbed(noBossesField, trackerFooter, embedColor)] });
            return noBosses;
        }
    } else {
        const noBossesOnTrackerListTitle = 'No bosses on the tracker list';
        const noBossesOnTrackerListMessage = 'There are currently no bosses on the tracker list\nTry using /setmvp to add them into it';
        const errorTrackerFooter = 'Please try again later or use /mvphelp to get more information';
        
        if(permaTrackerMessage && permaTrackerChannelId) {
            await permaTrackerMessage.edit({ embeds: [createMessageEmbed(noBossesOnTrackerListTitle, noBossesOnTrackerListMessage, embedColor, '❌', errorTrackerFooter)] });
            return;
        }

        const noBossesOnTrackerList = await send({ embeds: [createMessageEmbed(noBossesOnTrackerListTitle, noBossesOnTrackerListMessage, embedColor, '❌', errorTrackerFooter)] });
        return noBossesOnTrackerList;
    };
}

export default command;