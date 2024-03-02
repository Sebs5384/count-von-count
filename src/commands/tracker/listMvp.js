import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createBossListEmbed } from "../../embeds/index.js";
import { Boss, TrackerChannel } from "../../models/index.js";
import { getBossValuesField, formatBossesData } from "../../utils/general.js";

const command = new SlashCommandBuilder()
    .setName('listmvp')
    .setDescription('Displays the list of MVPs that are currently settled on guild')
command.aliases = ['lm', 'listmvp', 'lmvp'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;

    await runCommand(send, guild, embedColor);
};

async function runCommand(send, guild, embedColor) {
    
    try {
        const trackerChannelWithBosses = await TrackerChannel.findAll({
            where: { guild_id: guild.id },
            include: [{ 
                model: Boss 
            }]
        });
        
        if(!trackerChannelWithBosses) {
            const noTrackerChannelTitle = 'No tracker channel found';
            const noTrackerMessage = 'Please configure the tracker channel first'
            const noTrackerFooter = 'Use /settrackerchannel to create your own tracker channel and /setmvp to add an mvp'

            await send({ embeds: [createMessageEmbed(noTrackerChannelTitle, noTrackerMessage, embedColor, '❌', noTrackerFooter)] }); 
        };

        const bosses = trackerChannelWithBosses.flatMap((trackerChannel) => trackerChannel.Bosses.map((boss) => boss.dataValues));
        const hasBosses = bosses.length > 0;

        if(hasBosses) {
            const formattedBosses = formatBossesData(bosses);
            const bossesValuesString = formattedBosses.map((boss) => {
                const bossValues = getBossValuesField(boss);
                
                return bossValues;
            });
         
            await send({ embeds: [createBossListEmbed(bossesValuesString, guild, embedColor)] });
        } else {
            const noBossesTitle = 'No MVPs found';
            const noBossesMessage = 'There are no MVPs that are currently settled on your tracker';
            const noBossesFooter = 'Check /mvphelp for more information or use /setmvp to add an mvp';

            await send({ embeds: [createMessageEmbed(noBossesTitle, noBossesMessage, embedColor, '❌', noBossesFooter)] });
        }

    } catch(error) {
        console.log(error);

        const errorTitle = 'An error occurred while fetching the list of MvPs'
        const errorMessage = 'Please try using /listmvp again later'
        const errorFooter = 'For more information use /mvphelp'
        
        await send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
    };

};

export default command