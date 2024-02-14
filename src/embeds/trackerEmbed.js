import { EmbedBuilder } from 'discord.js'

function createTrackerEmbed(mvpList, embedColor) { 
  const trackerEmbed = new EmbedBuilder()
    .setTitle('MVP Tracker')
    .setFooter({ text: `This tracker updates every minute, last updated at: `})
    .setColor(embedColor);
  if(mvpList) {
    trackerEmbed.addFields(mvpList);
  }
  
  return trackerEmbed
}

export default createTrackerEmbed;