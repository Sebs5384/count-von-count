import { EmbedBuilder } from "discord.js";

function createRosterEmbed(rosterName, rosterThumbnail, organizer, mainRosterList, footer, embedColor) {
    const embed =  new EmbedBuilder()
        .setTitle(rosterName)   
        .setAuthor(organizer)
        .setDescription(mainRosterList)
        .setFooter({ text: footer })
        .setColor(embedColor)
    if(rosterThumbnail) {
        embed.setThumbnail(rosterThumbnail)
    };

    return embed
};

export default createRosterEmbed;