import { SlashCommandBuilder } from 'discord.js';
import { convertDateFormat, formatDate, isValidDateFormat } from '../utils/general.js';
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
  const birthdayDate = interaction.options.getString('date');
  const birthdayUser = interaction.options.getMentionable('user');

  const isValid = isValidDateFormat(birthdayDate) === true;
  const convertedDate = convertDateFormat(birthdayDate);
  const formatedDate = formatDate(birthdayDate);

  if (isValid) {
    try {
      const [user, created] = await Users.findOrCreate({
        where: { user_id: birthdayUser.user.id },
        defaults: { birthday_date: convertedDate },
      });

      if (!created) {
        await user.update({ birthday_date: convertedDate });
      }

      send(`Successfully set the birthday of ${birthdayUser} to ${formatedDate}`);
    } catch (error) {
      send('An error occurred while saving/updating the birthday record');
    }
  } else {
    send('Invalid date format given, please use DD-MM format with valid dates');
  }
};

export default command;
