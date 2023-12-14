import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from './config.json' assert { type: 'json' };

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (clientReady) => {
  console.log(`Logged in as ${clientReady.user.tag}`);
});

client.login(config.token);
