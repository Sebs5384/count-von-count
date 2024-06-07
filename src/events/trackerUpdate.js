import { Events } from "discord.js";
import { TrackerChannel } from "../models/index.js";
import  callbackTracker  from "../commands/tracker/tracker.js";
import cron from "node-cron"

export const event = Events.ClientReady;

export const callback = async(client) => {
    const EVERY_MINUTE = '* * * * *';

    cron.schedule(EVERY_MINUTE, ((async () => {
        try {
            const trackerChannels = await TrackerChannel.findAll();

            for(const trackerChannel of trackerChannels) {
                const { guild_id: guildId, perma_tracker_channel_id: channelId } = trackerChannel;

                try {
                    const guild = await client.guilds.fetch(guildId);
                    const channel = await guild.channels.fetch(channelId);

                    const messages = await channel.messages.fetch({ limit: 1 });
                    const message = messages.first();

                    if(message) {
                        const interactionMock = {
                            guild,
                            followUp: (content) => { message.edit(content) },
                        };

                        await callbackTracker.slashRun(client, interactionMock, message, channel);
                    } else {
                        console.error(`No message found in channel ${channelId}`);
                    };

                } catch(error) {
                    console.error(`Auto updating failed in guild ${guildId}: ${error}`);
                };
            };
        } catch (error) {
            console.error(`Auto updating failed: ${error}`);
        }
    })));
};