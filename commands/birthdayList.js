import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUsersTags, getUsersBirthdayDate, displayFormatedDate } from '../utils/general.js';
import Users from '../models/users.js';

const command = new SlashCommandBuilder()
  .setName('birthdaylist')
  .setDescription('Displays the list of users with their birthday');

command.aliases = ['bl', 'bdaylist', 'blist'];

command.slashRun = async function slashRun(client, interaction) {
  const send = interaction.followUp.bind(interaction);
  const { guild } = interaction.guild;
  const users = await Users.findAll();

  const usersList = await getUsersTags(users, client);
  const birthdayDateList = await getUsersBirthdayDate(users);
  const listEmbed = createBirthdayListEmbed(client, usersList, birthdayDateList, guild);

  send({ embeds: [listEmbed] });
};

function createBirthdayListEmbed(client, users, dateList, guild) {
  const birthdayUsers = users.map((user) => user);

  console.log(birthdayUsers);
  return new EmbedBuilder()
    .setTitle(`🍰 ${guild.name} Guild Upcoming Birthday List`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
    .setDescription(`Here is the list of users with their birthday \n 
        ${users.map((user) => `**${user}** - ${displayFormatedDate(dateList[users.indexOf(user)])}`).join('\n')}`)
    .setColor(client.config.embedColor);
}

export default command;
