import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createTrackerEmbed } from "../../embeds/index.js";
import { Boss, TrackerChannel } from "../../models/index.js";
import { getBossTimers, getGuildBosses } from "../../utils/general.js";

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
    const guildBosses = getGuildBosses(bosses);
    const mvpTimers = getBossTimers(guildBosses);

    await send({ embeds: [createTrackerEmbed(mvpTimers, embedColor)] });        
}

export default command;