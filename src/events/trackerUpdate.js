import { Events } from "discord.js";
import  callbackTracker  from "../commands/tracker/tracker.js";
import cron from "node-cron"

export const event = Events.ClientReady;

export const callback = async(client) => {
    const guildId = client.config.gonryunGuildInfo.id;
    const channelId = client.config.gonryunGuildInfo.permaTrackerChannelId;
    const messageId = client.config.gonryunGuildInfo.permaTrackerMessageId;

    const EVERY_MINUTE = '* * * * *';

    cron.schedule(EVERY_MINUTE, ((async () => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId);
            
            const interactionMock = {
                guild, followUp: (content) => { message.reply(content) }
            }

            await message.edit('')
            await callbackTracker.slashRun(client, interactionMock, message, channel);
        } catch (error) {
            console.error(`Auto updating failed: ${error}`);
        }
    })));
};