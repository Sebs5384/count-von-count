import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getServerTime } from "../../service/serverTime.js";
import { getRaceTime } from "../../utils/general.js";

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
        const raceMessageTitle = 'Summer Race';
        const raceMessage = `Race will begin in ${raceHours} hours and ${raceMinutes} minutes.`;
        const footerMessage = `Race timer set by ${user.username}`;
        const raceThumbnail = 'https://talontales.com/wiki/images/7/78/4_F_NYDHOG.gif';
        console.log(serverTime)

        send({ embeds: [createMessageEmbed(raceMessageTitle, raceMessage, embedColor, '🌞', footerMessage, raceThumbnail)] });
    } catch (error) {
        console.error(error);
    };
};

export default command;