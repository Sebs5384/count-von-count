import { SlashCommandBuilder } from 'discord.js';
import { formatDate, formatDateToMonthDayWithSuffix, isValidDateFormat } from '../utils/general.js';
import Users from '../models/users.js';

const command = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Setup the user birthday')
  .addStringOption((option) => option
    .setName('date')
    .setDescription('Input your birthday date in DD-MM format')
    .setRequired(true)
    .setMaxLength(5))
  .addMentionableOption((user) => user
    .setName('user')
    .setDescription('Input the user you want to set the birthday for')
    .setRequired(true));

command.aliases = ['b', 'bday', 'birthday'];

command.slashRun = async function slashRun(client, interaction) {
  const send = interaction.followUp.bind(interaction);
  const guildId = interaction.guild.id;
  const birthdayDate = interaction.options.getString('date');
  const birthdayUser = interaction.options.getMentionable('user');

  const isValid = isValidDateFormat(birthdayDate);
  const formatedDate = formatDate(birthdayDate);
  const formatedDateWithSuffix = formatDateToMonthDayWithSuffix(birthdayDate);

  if (isValid) {
    try { 
      await Users.sync({ force: false });

      const [user, created] = await Users.findOrCreate({
        where: { user_id: birthdayUser.user.id, channel_id: guildId },
        defaults: { birthday_date: formatedDate },
      });

      if (!created) {
        await user.update({ birthday_date: formatedDate });
      }
      send(`Successfully set the birthday of ${birthdayUser} to ${formatedDateWithSuffix}`);
    } catch (error) {
      send('An error occurred while saving/updating the birthday record');
    }
  } else {
    send('Invalid date format given, please use DD-MM format with valid dates');
  }
};

export default command;
