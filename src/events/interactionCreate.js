import { Events } from 'discord.js';

export const event = Events.InteractionCreate;

export const callback = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command || !('slashRun' in command)) {
    console.log(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await interaction.deferReply();
    await command.slashRun(client, interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
};
