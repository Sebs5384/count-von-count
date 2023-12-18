import { SlashCommandBuilder } from 'discord.js';

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

  const isValid = isValidDateFormat(birthdayDate) === true;

  const message = isValid ? 'The date is valid' : 'Please input a valid date';
  send(message);
};

function isValidDateFormat(date) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;

  return dateRegex.test(date);
}

export default command;
