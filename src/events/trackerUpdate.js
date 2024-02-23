import { Events } from "discord.js";
import  callbackTracker  from "../commands/tracker/tracker.js";
import cron from "node-cron"

export const event = Events.ClientReady;

export const callback = async(client) => {
    const guildId = '1108895835837714543';
    const channelId = '1209712616130478111';
    const messageId = '1209712621205327953';
    const EVERY_MINUTE = '* * * * *';

    cron.schedule(EVERY_MINUTE, ((async () => {


        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId);
            const interactionMock = {
                guild, followUp: (content) => { message.reply(content) }
            }

            await callbackTracker.slashRun(client, interactionMock, message, channel);

        } catch (error) {
            console.error(`Auto updating failed: ${error}`);
        }
    })));
};