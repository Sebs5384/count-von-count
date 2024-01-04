import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUsersTags, getUsersBirthdayDate, displayFormatedDate, calculateRemainingTime } from '../utils/general.js';
import Users from '../models/users.js';

const command = new SlashCommandBuilder()
  .setName('birthdaylist')
  .setDescription('Displays the list of users with their birthday');

command.aliases = ['bl', 'bdaylist', 'blist'];

command.slashRun = async function slashRun(client, interaction) {
  const { guild } = interaction;
  const send = interaction.followUp.bind(interaction);
  const users = await Users.findAll();

  const usersList = await getUsersTags(client, users);
  const birthdayDateList = await getUsersBirthdayDate(users);

  const remainingTime = calculateRemainingTime(users);
  const listEmbed = createBirthdayListEmbed(client, usersList, birthdayDateList, guild, remainingTime);

  send({ embeds: [listEmbed] });
};

function createBirthdayListEmbed(client, users, dateList, guild, remainingTime) {
  const guildName = guild.name;
  const birthdayUsers = users.map((user) => user);
  const birthdayDates = dateList.map((date) => displayFormatedDate(date));
  
  const birthdayList = birthdayUsers.map((user, index) => { return `${index + 1}. ${user} - ${birthdayDates[index]} 
  (${remainingTime[index].months 
  ? `In ${remainingTime[index].months} Months ${remainingTime[index].remainingDays} Days` 
  : `In ${remainingTime[index].remainingDays} Days ${remainingTime[index].remainingHours} Hours` })`;}).join('\n');

  return new EmbedBuilder()
    .setTitle(`🍰 ${guildName} Guild Upcoming Birthday List`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
    .setDescription(`Here is the list of users with their birthday \n${birthdayList}`)
    .setColor(client.config.embedColor);
}

function displayBirthdayList(users, birthdayDate, results) {

  const birthdayList = users.map((user, index) => `${index + 1}. ${user} - ${birthdayDate[index]} (${remainingTimeTillNextBirthday})`);
  
  return birthdayList;
}

export default command;
