import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { getRaceTime } from "../../utils/general.js";
import { Race, RaceChannel } from "../../models/index.js";
import { operator, literal } from "../../../database.js";

const command = new SlashCommandBuilder()
    .setName('setrace')
    .setDescription('Set the upcoming race time')
    .addIntegerOption((option) => option
        .setName('hours')
        .setDescription('Input the hours before the race starts')
        .setRequired(true)
    )
    .addIntegerOption((option) => option 
        .setName('minutes')
        .setDescription('Input the minutes before the race starts')
        .setRequired(true)
    )
command.aliases = ['setrace, sr'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const user = interaction.user;
    const embedColor = client.config.embedColor;

    const raceHours = interaction.options.getInteger('hours');
    const raceMinutes = interaction.options.getInteger('minutes');
    
    const serverTimeZone = 'America/Los_Angeles';
    let serverTime = await getServerTime(serverTimeZone);

    await runCommand(send, guild, user, embedColor, raceHours, raceMinutes, serverTime);
};

async function runCommand(send, guild, user, embedColor, raceHours, raceMinutes, serverTime) {
    try {
        const raceChannel = await RaceChannel.findOne({
            where: {
                guild_id: guild.id
            },
        });

        if(raceChannel) {
            
            try {
               
                const { raceTime, timePeriod } = getRaceTime(raceHours, raceMinutes, serverTime);
                const raceTittle = 'The Amazing Summer Race';
                const raceMessage = `Race time has been updated successfully\n \`Next will be at ${raceTime} ${timePeriod} Server Time\` \n\nPlease check the perma-race channel for a live update.`;
                const raceFooterMessage = `Last updated by ${user.tag}`;
                const raceThumbnail = 'https://talontales.com/wiki/images/7/78/4_F_NYDHOG.gif';
                const raceFooterImage = user.avatarURL();

                const raceEntry = await Race.findOne({
                    where: {
                        guild_id: raceChannel.guild_id,
                    }
                });

                if(raceEntry) {
                    await raceEntry.update({
                        next_race_time: raceTime,
                        race_settler_id: user.id,
                    })
                } else {
                    await Race.create({
                        guild_id: raceChannel.guild_id,
                        next_race_time: raceTime,
                        race_settler_id: user.id,
                    });
                };

                send({ embeds: [createMessageEmbed(raceTittle, raceMessage, embedColor, '✅', raceFooterMessage, raceThumbnail, raceFooterImage)] });
            } catch(error) {
                console.log(`Error while setting the race timer: ${error}`);

                const errorTitle = 'Error while setting the race timer';
                const errorMessage = `There was an error while setting the next race, inputting: ${raceHours} hours and ${raceMinutes} minutes`;
                const errorFooter = 'Please try again by using /setrace';

                send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
            };
        };
    } catch (error) {
        console.error(error);
    };
};

export default command;