import {Events, REST, Routes} from "discord.js";

export const event = Events.ClientReady;

export const callback = async function callback(client){

    (async () => {
        try{
            const rest = new REST().setToken(client.token);
            console.log("Refreshing application (/) commands.");
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: await client.commands
            })
            console.log(`Refreshed ${client.commands.size} application (/) commands.`);            
        } catch (error){
            console.log(`Error refreshing application (/) commands: ${error}`);
        }
    })();

    console.log(`Ready and logged as ${client.user.tag}`)
}
