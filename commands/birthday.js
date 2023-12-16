import { SlashCommandBuilder } from 'discord.js';

const command = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Setups the user birthday');
command.aliases = ['b', 'bday', 'birthday'];

command.slashRun = async function slashRun(client, interaction) {
  const send = interaction.followUp.bind(interaction);

  send('Hello its your bday');
};

export default command;
