import { EmbedBuilder } from 'discord.js'

function createTrackerEmbed(mvpList, embedColor) {
  const date = mvpList.map((mvp) => {
    const newDate = new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    })

    return newDate
  })
  console.log(date)
  
  return new EmbedBuilder()
    .setTitle(`MVP Tracker`)
    .setFields(
      mvpList.map((mvp) => ({
        name: mvp.name,
        value: `Start Time: ${mvp.killed}\n Map: ${mvp.map}`,
      }))
    )
    .setFooter({ text: `This tracker updates every minute, last updated at` })
    .setColor(embedColor)
}

export default createTrackerEmbed;