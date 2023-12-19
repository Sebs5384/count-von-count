import { SlashCommandBuilder } from 'discord.js';
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
  const formatedDate = convertDateFormat(birthdayDate);

  if (isValid) {
    try {
      const [user, created] = await Users.findOrCreate({
        where: { user_id: birthdayUser.user.id },
        defaults: { birthday_date: formatedDate },
      });

      if (!created) {
        await user.update({ birthday_date: formatedDate });
      }

      send(`Successfully set the birthday of ${birthdayUser} to ${birthdayDate}`);
    } catch (error) {
      send('An error occurred while saving/updating the birthday record');
    }
  } else {
    send('Invalid date format. Please use DD-MM format');
  }
};

function isValidDateFormat(date) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\-(0[1-9]|1[0-2])$/;

  return dateRegex.test(date);
}

function convertDateFormat(date){
  const [day, month] = date.split('-');
  const year = new Date().getFullYear();
  
  const dateObject = new Date(`${year}-${month}-${day}`);
  const formatedDate = dateObject.toISOString().split('T')[0];

  return formatedDate;
}

export default command;
