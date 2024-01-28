import { Events } from "discord.js";
import { getBirthdayUser, formatDate, getDateWithSuffix, getMember } from "../utils/general.js";
import { createBirthdayMessageEmbed } from "../embeds/index.js";
import { User, Guild, BirthdayChannel } from "../models/index.js";
import cron from "node-cron";

export const event = Events.ClientReady;

export const callback = async (client) => {
     
    const MIDNIGHT_TIME = '0 0 0 * * *'
    
    cron.schedule(MIDNIGHT_TIME, ((async () => {
        try {
            const users = (await User.findAll({
                include: { model: Guild },
            }))

            const birthdayUsers= await getBirthdayUser(users, client);
            const hasBirthday = birthdayUsers.length > 0;
            
            if(hasBirthday) {
                for(const birthdayUser of birthdayUsers) {

                    const userWithGuild = [];
                    const user = await User.findByPk(birthdayUser.id, {
                        include: { model: Guild },
                    })
                    userWithGuild.push(user);

                    const guildId = userWithGuild.flatMap((user) => user.Guilds.map((guild) => guild.dataValues.guild_id));
                   
                    const guildWithBirthdayChannel = []
                    for(const guild of guildId) {
                        const guilds = await Guild.findByPk(guild, {
                            include: { model: BirthdayChannel },
                        })      
                        guildWithBirthdayChannel.push(guilds);
                    }
                
                    const birthdayChannelId = guildWithBirthdayChannel.flatMap((guild) => guild.BirthdayChannels.map((channel) => channel.dataValues.birthday_channel));
                    
                    for(const birthdayChannel of birthdayChannelId) {
                        const channel = await client.channels.fetch(birthdayChannel);
                        const send = channel.send.bind(channel)
                        const guild = await channel.guild;

                        const birthdayUsersId = birthdayUser.id
                        const member = await getMember(guild, birthdayUsersId);
                    
                        await sendBirthdayMessage(send, client, guild, member); 
                    }
                }
            } else {
                console.log('No birthday users today');
            }
        } catch (error) {
            console.log(`Error sending birthday message / no birthday users today: ${error}`);
        }
    })));
}

async function sendBirthdayMessage(send, client, guild, member) {

    const countVonCount = await client.users.fetch(client.config.botId);
    const guildName = guild.name;
    const embedColor = client.config.embedColor;
    const memberJoinDate = member.joinedAt;
    const userName = member.user;

    const formatedDate = formatDate([memberJoinDate]);
    const userJoinedAt = getDateWithSuffix(formatedDate, true);

    const birthdayEmbed = createBirthdayMessageEmbed(embedColor, userName, userJoinedAt, guildName, countVonCount);
    send({ embeds: [birthdayEmbed] });
}