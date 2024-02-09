import { EmbedBuilder } from "discord.js";

function createBirthdayMessageEmbed(embedColor, userName, joinedAt, guildName, bot) {
    return new EmbedBuilder()
      .setAuthor({ name: 'Birthday Announcement 🎉 ', iconURL: 'https://cdn-icons-png.flaticon.com/512/1553/1553725.png?ga=GA1.1.1369033001.1704853799&'})
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/5022/5022305.png?ga=GA1.1.1369033001.1704853799&')
      .setDescription(`**Today is someone special day !!** \n 
        Please wish ${userName} a Happy birthday !`
      )
      .addFields({ 
        name: `\n${guildName} wishes you a splendide day `, 
        value: `\nThanks for being part of our community since ${joinedAt} \n We all wish you a wonderful day \n Cheers 🥂` 
      },
      { name: '\u200B', value: '\u200B' })
      .setFooter( { text: 'For more info use /help, to see the full list of birthdays date use /birthdaylist ', iconURL: bot.displayAvatarURL() } )

      .setColor(embedColor);
};

export default createBirthdayMessageEmbed;