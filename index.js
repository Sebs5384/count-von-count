import fs from 'node:fs';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import config from './config.json' assert { type: 'json' };

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.commandAliases = new Collection();

const commandsPath = './commands'
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file in commandFiles){
  const {command} = await import(`./commands/${commandFiles[file]}`)

  if('name' in command){
    const isSlashCommand = 'slashRun' in command
    const isPrefixCommand = 'prefixRun' in command

    if(!(isSlashCommand || isPrefixCommand)){
      console.log(`Command ${file} in ${commandsPath} is missing either slashRun or prefixRun`) 
      continue
    }

    client.commands.set(command.name, command)

    if(command.aliases){
      for(const alias of command.aliases){
        client.commandAliases.set(alias, command)
      }
    }

    console.log(`Loaded command ${command.name} as [Slash: ${isSlashCommand}], [Prefix: ${isPrefixCommand}], [Aliases: ${command.aliases}]`)
  } else {
    console.log(`Command ${file} in ${commandsPath} is missing name`)
  }
}

const discordEventsPath = './discord'
const discordEventFiles = fs.readdirSync(discordEventsPath).filter(file => file.endsWith('.js'));

for(const file in discordEventFiles){
  const {event, callback} = await import(`./discord/${discordEventFiles[file]}`)

  client.on(event, callback.bind(null, client))
}

client.login(config.token);
