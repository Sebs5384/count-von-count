/* eslint-disable import/prefer-default-export */
import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Setups the user birthday')
command.aliases = ['b', 'bday', 'birthday']

command.slashRun = async function slashRun(client, interaction){
  const channel = interaction.channel
  const send = interaction.followUp.bind(interaction)

  send('Hello its your bday')

}
