import { GuildMember, Role, SlashCommandBuilder } from 'discord.js';
import { formatToFullDate, getDateWithSuffix, isValidDateFormat } from '../utils/general.js';
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

  const guild = await interaction.guild;
  const send = interaction.followUp.bind(interaction);
  const birthdayDate = interaction.options.getString('date');
  const birthdayUser = interaction.options.getMentionable('user');  

  await runCommand(send, guild, interaction, birthdayDate, birthdayUser);
};

async function runCommand(send, guild, interaction, birthdayDate, birthdayUser) {
  if(birthdayUser instanceof GuildMember) {
    const isValid = isValidDateFormat(birthdayDate);
    const fullDate = formatToFullDate(birthdayDate);
    const formatedDateWithSuffix = isValid ? getDateWithSuffix([fullDate]) : null;
    
    const guildId = interaction.guild.id
    const isGuildOwner = interaction.member.id === interaction.guild.ownerId
    const isUser = birthdayUser.user.id === interaction.user.id
    
    
    if ((isValid && isUser) || isGuildOwner) {
      try { 
        await Users.sync({ force: false });
  
        const [user, created] = await Users.findOrCreate({
          where: { user_id: birthdayUser.user.id, channel_id: guildId },
          defaults: { birthday_date: fullDate },
        });
  
        if (!created) {
          await user.update({ birthday_date: fullDate });
        }
        send(`Successfully set the birthday of ${birthdayUser} to ${formatedDateWithSuffix}`);
      } catch (error) {
        send(`An error occurred while saving/updating the birthday record`);
      }
    } else {
      !isValid ? send(`Invalid date format given, please use DD-MM format with valid dates`) : null;
      !isUser ? send(`You can only set your own birthday`) : null;
    }
  } else {
    return send("You can't set the birthday of a role");
  }
}

export default command;
