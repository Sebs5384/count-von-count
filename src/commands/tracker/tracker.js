import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createTrackerEmbed } from "../../embeds/index.js";
import { Boss, TrackerChannel } from "../../models/index.js";
import { getBossTimers, getGuildBosses } from "../../utils/general.js";
import { getServerTime } from "../../service/serverTime.js";

const command = new SlashCommandBuilder()
    .setName('tracker')
    .setDescription('Displays the list of MVPs that are currently tracked')
command.aliases = ['t, tracker', 'mvps', 'bosses'];

command.slashRun = async function slashRun(client, interaction) {
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
    const trackerFooter = `This tracker auto updates every minute, last updated at: ${serverTime.time} Server Time `

    if(hasBosses) {
        const guildBosses = getGuildBosses(bosses);
        const mvpTimers = getBossTimers(guildBosses, serverTime);
        const hasMvpsTracked = mvpTimers.length > 0;

        if(hasMvpsTracked) {

            await send({ embeds: [createTrackerEmbed(mvpTimers, trackerFooter, embedColor)] });
        } else {

            const noMvpsField = { name: 'No mvps currently tracked 🛑', value: 'Its quiet for now, go get some bosses !' }
            await send({ embeds: [createTrackerEmbed(noMvpsField, trackerFooter, embedColor)] });
        }
    } else {
        const noBossesOnTrackerListTitle = 'No bosses on the tracker list';
        const noBossesOnTrackerListMessage = 'There are currently no bosses on the tracker \nList try using /setmvp to add them into it';
        const errorTrackerFooter = 'Please try again later or use /mvphelp to get more information';
        
        await send({ embeds: [createMessageEmbed(noBossesOnTrackerListTitle, noBossesOnTrackerListMessage, embedColor, '❌', errorTrackerFooter)] });
    };
       
}

export default command;