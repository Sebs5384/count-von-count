import { Events } from "discord.js";
import { getBirthdayUser, formatDate, getDateWithSuffix } from "../utils/general.js";
import { createBirthdayMessageEmbed } from "../utils/embeds.js";
import  Users  from "../models/users.js";

export const event = Events.ClientReady;

export const callback = async (client, message) => {
    const users = (await Users.findAll()).map(user => user.dataValues);

    (async () => {
        try {
            const { birthdayUser, userBirthdayDate, userGuildId } = await getBirthdayUser(users, client);
            
            const channel = client.channels.cache.get('1184679139505078272');
            const send = channel.send.bind(channel)
            const guild = await channel.guild;
            const guildMemberInfo = await guild.members.fetch(birthdayUser.id);
            const countVonCount = await client.users.fetch('1184628941194018869');
            const userIcon = birthdayUser.displayAvatarURL();
            const countVonCountIcon = countVonCount.displayAvatarURL();
            

            const memberJoinDate = guildMemberInfo.joinedAt;
            const guildName = guild.name;
            const embedColor = client.config.embedColor;
            const formatedDate = formatDate([memberJoinDate]);
            const userJoinedAt = getDateWithSuffix(formatedDate, true);
            ;
        
            const birthdayEmbed = createBirthdayMessageEmbed(embedColor, userIcon, birthdayUser, userJoinedAt, guildName, countVonCountIcon);
            send({ embeds: [birthdayEmbed] });

        } catch (error) {
            console.log(`Error sending birthday message or birthday users today: ${error}`);
        }
    })();
}