import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Race, RaceChannel } from "../../models/index.js";
import { formatRaceData, getRaceTimers } from "../../utils/general.js";
import { getServerTime } from "../../service/serverTime.js";

const command = new SlashCommandBuilder()
    .setName('race')
    .setDescription('Displays the upcoming race')
command.aliases = ['r'];    

command.slashRun = async function slashRun(client, interaction, permaRaceMessage, permaRaceChannelId) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;

    const raceChannelWithTimers = await RaceChannel.findAll({
        where: { guild_id: guild.id },
        include: [{ 
            model: Race 
        }],
    });

    const timers = raceChannelWithTimers.flatMap((raceChannel) => raceChannel.Races.map((race) => race.dataValues));
    const hasTimers = timers.length > 0;

    const serverTimeZone = 'America/Los_Angeles';
    const serverTime = await getServerTime(serverTimeZone);
    const timerFooter = `Race timer updates every minute, last updated at: ${serverTime.date} ${serverTime.time} Server Time \nCurrent Location: (${serverTimeZone.replace('_', ' ')})`;

    if(hasTimers) {
        const formattedRaceTimers = formatRaceData(timers);
        const currentRaceTimers = getRaceTimers(formattedRaceTimers, serverTime);

        
    };
};

export default command;