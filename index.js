import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import config from './config.json' assert { type: 'json' };

const client = new Client({ 
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.User,
  ],
  intents: [
    GatewayIntentBits.Guilds,   
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
  ] 
});

client.commands = new Collection();
client.commandAliases = new Collection();
client.config = config

const commandsPath = 'src/commands'
const commandFolders = fs.readdirSync(commandsPath);

for(const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));  

  for(const file of commandFiles){

    const filePath = path.join(folderPath, file);
    const { default: command } = await import(`./${filePath}`);
  
    if('name' in command){
      const isSlashCommand = 'slashRun' in command
      const isPrefixCommand = 'prefixRun' in command
  
      if(!(isSlashCommand || isPrefixCommand)){
        console.log(`Command ${file} in ${commandsPath} is missing either slashRun or prefixRun`) 
        continue
      };
  
      client.commands.set(command.name, command)
  
      if(command.aliases){
        for(const alias of command.aliases){
          client.commandAliases.set(alias, command)
        }
      }
  
      console.log(`Loaded command ${command.name} as [Slash: ${isSlashCommand}], [Prefix: ${isPrefixCommand}], [Aliases: ${command.aliases}]`)
    } else {
      console.log(`Command ${commandFiles[file]} in ${commandsPath} is missing name`)
    }
  }
}

const discordEventsPath = 'src/events'
const discordEventFiles = fs.readdirSync(discordEventsPath).filter(file => file.endsWith('.js'));

for(const file in discordEventFiles){
  const {event, callback} = await import(`./src/events/${discordEventFiles[file]}`)

  client.on(event, callback.bind(null, client))
}

client.login(client.config.token);
