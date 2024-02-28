import { SlashCommandBuilder } from "discord.js";
import { Boss, TrackerChannel } from "../../models/index.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { operator } from "../../../database.js";

const command = new SlashCommandBuilder()
    .setName('removemvp')
    .setDescription('Removes an MVP From the tracker list permanently')
    .addStringOption((option) => option
        .setName('mvp-name')
        .setDescription('Input the name of the MVP to be removed e.g Kraken, required field')
        .setMaxLength(30)
        .setRequired(true)
    )
command.aliases = ['rm', 'remove', 'removemvp', 'rmvp'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;

    const bossName = interaction.options.getString('name');


    await runCommand(send, guild, embedColor, bossName);
};

async function runCommand(send, guild, embedColor, bossName) {

    try {
        const trackerChannel = await TrackerChannel.findOne({
            where: { guild_id: guild.id }
        });

        if(!trackerChannel) {
            const noTrackerChannelTitle = 'No tracker channel found';
            const noTrackerMessage = 'Please configure the tracker channel first'
            const noTrackerFooter = 'Use /settrackerchannel to create your own tracker channel'

            await send({ embeds: [createMessageEmbed(noTrackerChannelTitle, noTrackerMessage, embedColor, '❌', noTrackerFooter)] });
        };

        const existingBoss = await Boss.findOne({
            where: {
                guild_id: trackerChannel.guild_id,
                boss_name: {
                    [operator.like]: bossName
                }
            },
            collate: 'NOCASE'
        });

        if(!existingBoss) {
            const noBossFoundTitle = 'No MVP found';
            const noBossFoundMessage = `The MVP was not found in the track list, reading: ${bossName}`;
            const noBossFoundFooter = 'Check /mvphelp for more information';

            await send({ embeds: [createMessageEmbed(noBossFoundTitle, noBossFoundMessage, embedColor, '❌', noBossFoundFooter)] });
        };

        if(existingBoss) {
            const removedBoss = await Boss.destroy({
                where: {
                    guild_id: trackerChannel.guild_id,
                    boss_name: bossName
                }
            });

            if(removedBoss) {
                const removedBossTitle = 'Removed MVP Successfully';
                const removedBossMessage = `${existingBoss.boss_name} was removed from the tracker list`;
                const removedBossFooter = 'If you wish to add it back, use /setmvp';


                await send({ embeds: [createMessageEmbed(removedBossTitle, removedBossMessage, embedColor, '✅', removedBossFooter)] });
            } else {
                const noBossFoundTitle = 'No MVP found';
                const noBossFoundMessage = `The MVP was not foudn in the track list, reading: ${bossName}`;
                const noBossFoundFooter = 'Check /mvphelp for more information';

                await send({ embeds: [createMessageEmbed(noBossFoundTitle, noBossFoundMessage, embedColor, '❌', noBossFoundFooter)] });
            }
        }

    } catch(error) {
        
        console.error(error);
        const errorTitle = 'Error Removing MVP';
        const errorMessage = `There was an error removing the MVP: ${bossName}`;
        const errorFooter = 'Try again later or use /mvphelp for more information';

        await send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
    };
};

export default command;