import { Events } from "discord.js";
import { RaceChannel } from "../models/index.js";

export const event = Events.ClientReady;

export const callback = async (client) => {
    try {
        const raceChannels = await RaceChannel.findAll();

        for(const raceChannel of raceChannels) {
            const RACE_PING_ROLE_NAME = "Racer";
            const EMOJI_NAME = "🏁";
            const { guild_id: GUILD_ID, perma_race_channel_id: CHANNEL_ID } = raceChannel;

            try {
                const guild = client.guilds.cache.get(GUILD_ID);
                const channel = await guild.channels.fetch(CHANNEL_ID);
                const messages = await channel.messages.fetch({ limit: 1 })
                const message = messages.first();
        
                if (!message.reactions.cache.has(EMOJI_NAME)) {
                    await message.react(EMOJI_NAME);
                }
        
                client.on(Events.MessageReactionAdd, async (reaction, user) => {
                    if (reaction.message.id === message.id && reaction.emoji.name === EMOJI_NAME && !user.bot) {
                        const role = guild.roles.cache.find(role => role.name === RACE_PING_ROLE_NAME);
                        const member = await guild.members.fetch(user.id);
        
                        if (role && !member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            console.log(`Assigned "${RACE_PING_ROLE_NAME}" role to ${user.username}`);
                        }
                    }
                });
        
                client.on(Events.MessageReactionRemove, async (reaction, user) => {
                    if (reaction.message.id === message.id && reaction.emoji.name === EMOJI_NAME && !user.bot) {
                        const role = guild.roles.cache.find(role => role.name === RACE_PING_ROLE_NAME);
                        const member = await guild.members.fetch(user.id);
        
                        if (role && member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            console.log(`Removed "${RACE_PING_ROLE_NAME}" role from ${user.username}`);
                        }
                    }
                });
        
                console.log(`Reaction handlers are set up for message ID ${message.id}.`);
        
            } catch (error) {
                console.error("Error setting up reaction handlers:", error);
            }
        };
    } catch(error) {
        console.error(`No race channel found`);
    };
};