import { SlashCommandBuilder } from 'discord.js';
import { getUserList, getUsersBirthdayDate, getDateWithSuffix, calculateRemainingTime, formatRemainingTime, getBirthdayList, formatDate, getRemainingTimeMessage } from '../utils/general.js';
import { createBirthdayListEmbed } from '../utils/embeds.js';
import { User, Guild } from '../models/index.js';

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
  const today = new Date();
  const guildName = guild.name;
  const guildIcon = guild.iconURL({ dynamic: true, size: 2048 });
  const embedColor = client.config.embedColor;

  const guildUsers = await Guild.findByPk(guild.id, {
    include: [{ model: User }],
    order: [[User, 'birthday_date', 'ASC']],
  })

  const users = guildUsers.Users;

  const userList = await getUserList(client, users);
  const usersBirthday = getUsersBirthdayDate(users);

  const formatedDate = formatDate(usersBirthday);
  const usersBirthdayWithSuffix = getDateWithSuffix(formatedDate);
  const remainingTime = await calculateRemainingTime(users, today);
  const timeTillNextBirthday = formatRemainingTime(remainingTime, today);
  const remainingTimeMessage = getRemainingTimeMessage(timeTillNextBirthday);

  const birthdayList = getBirthdayList(userList, usersBirthdayWithSuffix, remainingTimeMessage);
  const listEmbed = createBirthdayListEmbed(embedColor, guildIcon, guildName, birthdayList);

  send({ embeds: [listEmbed] });
}

export default command;
