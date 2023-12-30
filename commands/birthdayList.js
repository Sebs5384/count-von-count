import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUsersTags, getUsersBirthdayDate, displayFormatedDate, calculateRemainingDays } from '../utils/general.js';
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
  calculateRemainingDays(users);
  const listEmbed = createBirthdayListEmbed(client, usersList, birthdayDateList, guild);

  send({ embeds: [listEmbed] });
};

function createBirthdayListEmbed(client, users, dateList, guild) {
  const guildName = guild.name;
  const birthdayUsers = users.map((user) => user);
  const birthdayDates = dateList.map((date) => displayFormatedDate(date));

  return new EmbedBuilder()
    .setTitle(`🍰 ${guildName} Guild Upcoming Birthday List`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
    .setDescription(`Here is the list of users with their birthday \n 
        ${birthdayUsers.map((user) => `${user} - ${birthdayDates[birthdayUsers.indexOf(user)]}`).join('\n')}`)
    .setColor(client.config.embedColor);
}

export default command;
