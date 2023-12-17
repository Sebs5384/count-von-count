import { SlashCommandBuilder } from 'discord.js';

const command = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Setup the user birthday')
  .addStringOption((option) => 
    option
      .setName('date')
      .setDescription('Input your birthday date in DD/MM format')
      .setRequired(true)
  )
command.aliases = ['b', 'bday', 'birthday'];

command.slashRun = async function slashRun(client, interaction) {
  const send = interaction.followUp.bind(interaction);
  const birthdayDate = interaction.options.getString('date')

  const isValid = isValidDateFormat(birthdayDate) === true

  isValid ? send('The date is valid') : send('Please input a valid date')

};

function isValidDateFormat(date){
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/
  
  if (dateRegex.test(date)) return true
}

export default command;
