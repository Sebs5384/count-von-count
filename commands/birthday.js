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
  const convertedDate = convertDateFormat(birthdayDate);
  const formatedDate = displayFormatedDate(birthdayDate);

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
    send('Invalid date format. Please use DD-MM format');
  }
};

function isValidDateFormat(date) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\-([0]?[1-9]|1[0-2])$/;

  return dateRegex.test(date);
}

function convertDateFormat(date){
  const [day, month] = date.split('-');
  const year = new Date().getFullYear();
  
  const dateObject = new Date(`${year}-${month}-${day}`);
  const convertedDate = dateObject.toISOString().split('T')[0];

  return convertedDate;
}

function displayFormatedDate(date){
  const [day, month] = date.split('-')
  const MONTHS_OF_YEAR = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayWithSuffix =  () => {
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;	
      default: return `${day}th`;
    }
  }

  for (const monthIndex in MONTHS_OF_YEAR) {
    const monthIndexNumber = Number(monthIndex) + 1;
    if (monthIndexNumber == month) {

      return `${dayWithSuffix()} of ${MONTHS_OF_YEAR[monthIndex]}`;
    };
  };

};

export default command;
