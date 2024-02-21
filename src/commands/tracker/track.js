import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { TrackerChannel, Boss } from "../../models/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { operator } from "../../../database.js";

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
    const mvpHelpMessage = 'For more information use /mvphelp';

    await runCommand(send, guild, embedColor, mvpName, mvpHelpMessage);
};

async function runCommand(send, guild, embedColor, mvpName, footer){
        
    const trackerChannel = await TrackerChannel.findOne({
        where: { guild_id: guild.id },
    })

    if(trackerChannel) {
        const boss = await Boss.findOne({
            where: { 
                guild_id: guild.id, 
                boss_name: {
                    [operator.like]: mvpName
                }
            },
            collate: 'NOCASE'
        });

        if(boss.boss_name === mvpName) {
            const serverTimeZone = 'America/Los_Angeles';
            const serverTime = await getServerTime(serverTimeZone);

            const updatedBoss = await boss.update({
                boss_killed_at: serverTime.time
            })

            const trackerTitle = 'MvP Tracker';
            const trackerMessage = `${updatedBoss.boss_name} died at ${updatedBoss.boss_killed_at}`;
            
            send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '✅', footer)] });
        } else {
            const trackerTitle = 'No MvP found';
            const trackerMessage = `This mvp is not found in the tracker list, reading: ${mvpName}`;
            
            send({ embeds: [createMessageEmbed(trackerTitle, trackerMessage, embedColor, '❌', footer)] });
        }
    }
}

export default command;