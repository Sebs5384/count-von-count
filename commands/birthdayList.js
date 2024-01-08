import { SlashCommandBuilder } from 'discord.js';
import { getUserList, getUsersBirthdayDate, formatDate, calculateRemainingTime, getBirthdayList } from '../utils/general.js';
import { createBirthdayListEmbed } from '../utils/embeds.js';
import Users from '../models/users.js';

const command = new SlashCommandBuilder()
  .setName('birthdaylist')
  .setDescription('Displays the list of users with their birthday');

command.aliases = ['.bl', '.bdaylist', '.blist'];

command.prefixRun = async function prefixRun(client, message) {
  const channel = message.channel;
  const send = channel.send.bind(channel);
  const guild = await channel.guild;

  await runCommand(client, guild, send);
}

command.slashRun = async function slashRun(client, interaction) {
  const channel = interaction.channel
  const send = interaction.followUp.bind(interaction);
  const guild = await channel.guild;

  await runCommand(client, guild, send);
}

async function runCommand(client, guild, send) {
  const users = await Users.findAll({ where: { channel_id: guild.id } });
  const userList = await getUserList(client, users);
  const birthdayDateList = getUsersBirthdayDate(users).map((date) => formatDate(date));
  const timeTillNextBirthday = await calculateRemainingTime(users);

  const guildName = guild.name;
  const guildIcon = guild.iconURL({ dynamic: true, size: 2048 });
  const embedColor = client.config.embedColor

  const birthdayList = getBirthdayList(userList, birthdayDateList, timeTillNextBirthday);
  const listEmbed = createBirthdayListEmbed(embedColor, guildIcon, guildName, birthdayList);

  send({ embeds: [listEmbed] });
}

export default command;
