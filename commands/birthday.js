import { SlashCommandBuilder } from 'discord.js';
import Users from '../models/users.js';

const command = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Setup the user birthday')
  .addStringOption((option) => option
    .setName('date')
    .setDescription('Input your birthday date in DD/MM format')
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

  console.log(birthdayDate)
  console.log(birthdayUser.user.id)

  const isValid = isValidDateFormat(birthdayDate) === true;

  if (isValid) {
    try{
      const [user, created] = await Users.findOrCreate({
        where: { user_id: birthdayUser.user.id },
        defaults: { birthday_date: birthdayDate} 
      })

      if(!created) {
        user = await user.update({ birthday_date: birthdayDate })
      }
      send(`Successfully set the birthday of ${birthdayUser} to ${birthdayDate}`)
    } catch (error) {
      send('An error occurred while saving/updating the birthday record')
    }
  } else {
    send('Invalid date format. Please use DD/MM format')
  }
};

function isValidDateFormat(date) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;

  return dateRegex.test(date);
}

export default command;
