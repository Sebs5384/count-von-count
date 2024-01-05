import { Events } from 'discord.js';

console.log("hi")
export const event = Events.MessageCreate;

export const callback = async (client, message) => {

    if(message.author.bot || !message.guild || !message.id) return;

    const botWasMentioned = message.mentions.has(client.user);
    const botPrefix = client.config.prefix;
    const hasPrefix = message.content.startsWith(botPrefix);

    if(!(botWasMentioned || hasPrefix)) return;

    let contentWithoutPrefix = undefined;

    if(hasPrefix) {
        contentWithoutPrefix = message.content.slice(botPrefix.length);
    } else if(botWasMentioned) {
        contentWithoutPrefix = message.content.slice(client.user.mention.length);
    }

    console.log(`Command: ${contentWithoutPrefix}`);

    const tokens = contentWithoutPrefix.trim().split(' ');
    const commandName = tokens.shift();

    let command = client.commandAliases.get(commandName);

    if(!command) command = client.commands.get(commandName);
    
    if(!command || !('prefixRun' in command)) {
        console.error(`No command matchin ${commandName} was found.`);
        return;
    } 

    try {
        await command.prefixRun(client, message, tokens.join(' '));
    } catch(error) {
        console.error(error);
        await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}