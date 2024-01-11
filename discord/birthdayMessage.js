import { Events } from "discord.js";
import { getBirthdayUser, formatDate, getDateWithSuffix } from "../utils/general.js";
import { createBirthdayMessageEmbed } from "../utils/embeds.js";
import cron from "node-cron";
import  Users  from "../models/users.js";

export const event = Events.ClientReady;

export const callback = async (client) => {
     
    const MIDNIGHT_TIME = '0 0 * * *' // Min/Hour/Day/Month/Weekday
    cron.schedule( MIDNIGHT_TIME, (async () => {
        try {
            const users = (await Users.findAll()).map(user => user.dataValues);
            const channel = client.channels.cache.get('1184679139505078272');
            const send = channel.send.bind(channel)
            const guild = await channel.guild;
            
            await sendBirthdayMessage(send, client, guild, users);

        } catch (error) {
            console.log(`Error sending birthday message / no birthday users today: ${error}`);
        }
    }));
}

async function sendBirthdayMessage(send, client, guild, users) {
    const { birthdayUser } = await getBirthdayUser(users, client);
    
    const guildMemberInfo = await guild.members.fetch(birthdayUser.id);
    const countVonCount = await client.users.fetch('1184628941194018869');
    const memberJoinDate = guildMemberInfo.joinedAt;
    const guildName = guild.name;
    const embedColor = client.config.embedColor;

    const formatedDate = formatDate([memberJoinDate]);
    const userJoinedAt = getDateWithSuffix(formatedDate, true);

    const birthdayEmbed = createBirthdayMessageEmbed(embedColor, birthdayUser, userJoinedAt, guildName, countVonCount);
    send({ embeds: [birthdayEmbed] });
}