import { GuildMember, Role, SlashCommandBuilder } from 'discord.js';
import { formatToFullDate, getDateWithSuffix, isValidDateFormat } from '../utils/general.js';
import { User, Guild, UserGuild, BirthdayChannel } from '../models/index.js';

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
    const isValidDate = isValidDateFormat(birthdayDate);
    const fullDate = formatToFullDate(birthdayDate);
    const formatedDateWithSuffix = isValidDate ? getDateWithSuffix([fullDate]) : undefined;

    const guildOwner = interaction.guild.ownerId
    const guildId = interaction.guild.id
    const isGuildOwner = interaction.member.id === guildOwner
    const isUser = birthdayUser.user.id === interaction.user.id
    const isBot = birthdayUser.user.bot
    
    
    if ((isValidDate && isUser && !isBot) || isGuildOwner) {
      try { 
        if(!isValidDate && isBot) return send(`You might be the guild owner, but you can't input an invalid date / bot birthday`);

        const isGuildRegistered = await Guild.findOne({ where: { guild_id: guildId } });
        if(!isGuildRegistered) return send(`The guild master must set the birthday channel first`);

        const isBirthdayChannel = await BirthdayChannel.findOne({ where: { guild_id: guildId } });
        if(!(isBirthdayChannel.birthday_channel === interaction.channel.id)) return send(`You can only set commands at <#${isBirthdayChannel.birthday_channel}>`)

        const [user, createdUser] = await User.findOrCreate({
          where: { user_id: birthdayUser.user.id },
          defaults: { user_name: birthdayUser.user.username, birthday_date: fullDate },
        });
   
        const [userGuild, createdUserGuild] = await UserGuild.findOrCreate({
          where: { user_id: user.user_id, guild_id: guildId },
        });
        
        if (!createdUser) await user.update({ birthday_date: fullDate });
      
        send(`Successfully set the birthday of ${birthdayUser} to ${formatedDateWithSuffix}`);
      } catch (error) {
        send(`An error occurred while saving/updating the birthday record`, console.log(error));
      }
    } else {
      !isValidDate && !isUser
        ? send(`You can't set others birthday with an invalid date format`)
        : !isValidDate
        ? send(`Invalid date format given, please use DD-MM format with valid dates`)
        : !isUser
        ? send(`You can only set your own birthday`)
      : null;
    }
  } else {
    return send("You can't set the birthday of a role");
  }
}

export default command;
