import { Events } from "discord.js";
import { getBirthdayUser, formatDate, getDateWithSuffix, getMembersList } from "../utils/general.js";
import { createBirthdayMessageEmbed } from "../utils/embeds.js";
import { User, Guild, BirthdayChannel } from "../models/index.js";
import cron from "node-cron";

export const event = Events.ClientReady;

export const callback = async (client) => {
     
    
    ((async () => {
        try {
            const users = (await User.findAll({
                include: { model: Guild },
            }))

            const birthdayUsers= await getBirthdayUser(users, client);
            console.log(birthdayUsers)
            const hasBirthday = birthdayUsers.length > 0;
   
            if(hasBirthday) {
                for( const userT of birthdayUsers) {
     
                
                    const channel = client.channels.cache.get('1173789996017254472'); 
                    const send = channel.send.bind(channel)
                    const guild = await channel.guild;

                    const birthdayUsersId = user.id
                    const guildMembers = await getMembersList(guild, birthdayUsersId);
                
                
                    await sendBirthdayMessage(send, client, guild, member);    
                }
            }

        } catch (error) {
            console.log(`Error sending birthday message / no birthday users today: ${error}`);
        }
    }))();
}

async function sendBirthdayMessage(send, client, guild, member) {
    const birthdayChannel = await Guild.findByPk(member.guild.id, {
        include: { model: BirthdayChannel },
    })
    const birthdayChannelId = birthdayChannel.BirthdayChannels[0].dataValues.birthday_channel;

    const countVonCount = await client.users.fetch('1184628941194018869');
    const guildName = guild.name;
    const embedColor = client.config.embedColor;
    const memberJoinDate = member.joinedAt;
    const userName = member.user;

    const formatedDate = formatDate([memberJoinDate]);
    const userJoinedAt = getDateWithSuffix(formatedDate, true);

    const birthdayEmbed = createBirthdayMessageEmbed(embedColor, userName, userJoinedAt, guildName, countVonCount);
    send({ embeds: [birthdayEmbed] });
}