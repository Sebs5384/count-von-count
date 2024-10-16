import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createRaceEmbed } from "../../embeds/index.js";
import { Race, RaceChannel } from "../../models/index.js";
import { formatRaceData, getRaceTimers, getRaceTime } from "../../utils/general.js";
import { getServerTime } from "../../service/serverTime.js";

const command = new SlashCommandBuilder()
    .setName('race')
    .setDescription('Displays the upcoming race')
command.aliases = ['r'];    

command.slashRun = async function slashRun(client, interaction, permaRaceMessage, permaRaceChannelId, raceChannelId) {
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
    const timerTitle = '⛱☀  Race Timer'
    const timerFooter = `Race timer updates every minute, last updated at: ${serverTime.date} ${serverTime.time} Server Time \nCurrent Location: (${serverTimeZone.replace('_', ' ')})\nIf you wish to set the timer use /setrace command`;

    if(hasTimers) {
        const formattedRaceTimers = formatRaceData(timers);
        const currentRaceTimers = getRaceTimers(formattedRaceTimers, serverTime);

        const updatedRaceTimers = await Promise.all(currentRaceTimers.map(async (race) => {
            if(!race) {
                return race;
            };

            if(race.raceStarted) {
                const role = guild.roles.cache.find(role => role.name === 'Racer');
                if(role) {
                    const roleMention = `<@&${role.id}>`;
                    const messageContent = `Attention, ${roleMention}! The race has started!`;
                    await raceChannelId.send({ content: messageContent });
                };
            };

            if(race.raceToRemove) {
                await Race.update(
                    { last_settled_race_time: null },
                    {
                        where: {
                            guild_id: race.guild_id,
                            id: race.raceToRemove
                        }
                    }
                );

                return;
            } else {
                return race;
            };
        }));
        
        const filteredRaceTimers = updatedRaceTimers.filter((race) => race !== undefined);
        const hasRaceTimers = filteredRaceTimers.length > 0;

        if(hasRaceTimers) {
            if(permaRaceMessage && permaRaceChannelId) {
                
                await permaRaceMessage.edit({ embeds: [createRaceEmbed(timerTitle, filteredRaceTimers, embedColor, timerFooter)]});
            };

            const raceList = await send({ embeds: [createRaceEmbed(timerTitle, filteredRaceTimers, embedColor, timerFooter)] });
            return raceList;
        } else {
            const noRacesField = { name: 'No upcoming races have been settled 🛑', value: 'To settle a race timer use /setrace'}
            if(permaRaceMessage && permaRaceChannelId) {
                await permaRaceMessage.edit({ embeds: [createRaceEmbed(timerTitle, noRacesField, embedColor, timerFooter)]});
                return;
            };

            const noRaces = await send({ embeds: [createRaceEmbed(timerTitle, noRacesField, embedColor, timerFooter)] });
            return noRaces;
        };
    } else {

        const noRaceTrackedTitle = 'No races tracked yet';
        const noRaceTrackedMessage = 'There are currently no race on the timer list\n Try using /setrace to add them according to the NPC timer in Port Malaya'
        
        if(permaRaceMessage && permaRaceChannelId) {
            await permaRaceMessage.edit({ embeds: [createMessageEmbed(noRaceTrackedTitle, noRaceTrackedMessage, embedColor, '🛑')]});
            return;
        };

        const noRaces = await send({ embeds: [createMessageEmbed(noRaceTrackedTitle, noRaceTrackedMessage, embedColor, '🛑')]});
        return noRaces;
    };
};

export default command;