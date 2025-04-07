import { EmbedBuilder } from "discord.js";

function createRosterEmebed(rosterName, rosterThumbnail, organizer, mainRosterList, footer, embedColor) {
    return new EmbedBuilder()
        .setTitle(rosterName)   
        .setThumbnail(rosterThumbnail)
        .setAuthor(organizer)
        .setDescription(mainRosterList)
        .setFooter({ text: footer })
        .setColor(embedColor)
};

export default createRosterEmebed;