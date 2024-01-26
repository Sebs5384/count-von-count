import { EmbedBuilder } from 'discord.js'

function createTrackerEmbed(embedColor, mvpList) {
    return new EmbedBuilder()
      .setTitle(`MVP Tracker`)
      .setColor(embedColor)
}

export default createTrackerEmbed;