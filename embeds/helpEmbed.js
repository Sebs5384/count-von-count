import { EmbedBuilder } from "discord.js";

function createHelpEmbed(commandsMessage, embedColor, botIcon) {

    return new EmbedBuilder()
        .setAuthor({ name: `List of commands 🔍`, iconURL: botIcon })
        .setDescription(`Here is the list of commands and descriptions`)
        .addFields({name: 'Commands', value: `${commandsMessage}`})
        .setFooter({ text: 'Ha ha ha, glad to help you !'})
        .setColor(embedColor)
}

export default createHelpEmbed;
