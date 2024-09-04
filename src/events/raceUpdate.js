import { Events } from "discord.js";
import { RaceChannel } from "../models/index.js";
import callbackRace from "../commands/summerRace/race.js";
import cron from "node-cron";

export const event = Events.ClientReady;

export const callback = async(client) => {
    const EVERY_MINUTE = '* * * * *';

    cron.schedule(EVERY_MINUTE, ((async () => {
        try {
            const raceChannels = await RaceChannel.findAll();

            for(const raceChannel of raceChannels) {
                const { guild_id: guildId, perma_race_channel_id: channelId } = raceChannel;

                try {
                    const guild = await client.guilds.fetch(guildId);
                    const channel = await client.channels.fetch(channelId);

                    const messages = await channel.messages.fetch({ limit: 1 });
                    const message = messages.first();

                    if(message) {
                        const interactionMock = {
                            guild,
                            followUp: (content) => { message.edit(content) },
                        };

                        await callbackRace.slashRun(client, interactionMock, message, channel);
                    } else {
                        console.error(`No message found in channel ${channelId}`);
                    };

                } catch(error) {
                    console.error(`Auto updating failed in guild ${guildId}: ${error}`);
                };

            };

        } catch(error) {
            console.error(`Auto updating failed: ${error}`);
        };
    })));

};