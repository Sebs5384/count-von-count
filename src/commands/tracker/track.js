import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel, Boss } from "../../models/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { operator } from "../../../database.js";
import { Op } from "sequelize";

const command = new SlashCommandBuilder()
    .setName('track')
    .setDescription('Tracks an MVP')
    .addStringOption((option) => option
        .setName('mvp-name')
        .setDescription('Input the name of the MVP you want to track')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0);
command.aliases = ['t', 'track'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const mvpName = interaction.options.getString('mvp-name');

    await runCommand(send, guild, embedColor, mvpName)
};

async function runCommand(send, guild, embedColor, mvpName){
    const trackerChannel = await TrackerChannel.findOne({
        where: { guild_id: guild.id },
    })

    if(trackerChannel) {
        const boss = await Boss.findOne({
            where: { guild_id: guild.id },
            options: {
                where: {
                    boss_name: {
                        [operator.like]: mvpName
                    }
                },
                collate: 'NOCASE'
            }
        });

        if(boss) {
            const serverTimeZone = 'America/Los_Angeles';
            const serverTime = await getServerTime(serverTimeZone);

            const updatedBoss = await boss.update({
                boss_killed_at: serverTime.time
            })

            const trackerTitle = 'MvP Tracker';
            const trackerMessage = `${updatedBoss.boss_name} died at ${updatedBoss.boss_killed_at}`;
            const mvpHelpMessage = 'For more information use /mvphelp';
            
            send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '✅', mvpHelpMessage)] });
        }
    }
}

export default command;