import { EmbedBuilder } from "discord.js";

function createMessageEmbed(message, description, embedColor, emoji = '', footer = null, thumbnail = null, footerImg = null, image = null) {
    return new EmbedBuilder()   
        .setTitle(`${emoji}  ${message} `)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .setFooter({ text: footer, iconURL: footerImg })
        .setColor(embedColor)
        .setImage(image)
}

export default createMessageEmbed;