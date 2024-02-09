import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createTrackerEmbed } from "../../embeds/index.js";
import { Boss, TrackerChannel } from "../../models/index.js";

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
            killed: boss.updatedAt
        }

        guildBosses.push(mvp);
    }

    console.log(guildBosses);
    await send({ embeds: [createTrackerEmbed(guildBosses, embedColor)] });

}

export default command;