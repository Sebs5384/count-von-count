import { EmbedBuilder } from 'discord.js'

function createTrackerEmbed(mvpList, trackerFooter,embedColor) { 
  const trackerEmbed = new EmbedBuilder()
    .setTitle('MVP Tracker')
    .setFooter({ text: trackerFooter })
    .setColor(embedColor);
  if(mvpList) {
    trackerEmbed.addFields(mvpList);
  }
  
  return trackerEmbed
}

export default createTrackerEmbed;