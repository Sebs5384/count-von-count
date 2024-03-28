import { SlashCommandBuilder } from "discord.js";
import fs from 'fs';

const command = new SlashCommandBuilder()
    .setName('listsqi')
    .setDescription('List all the SQI items')

command.aliases = ['listsqi', 'ls', 'sqilist'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;

    await runCommand(send, guild, embedColor, interaction);
};

async function runCommand(send, guild, embedColor, interaction) {

    try{
        const sqiFiles = fs.readdirSync('src/data/sqi');
        const sqiNames = sqiFiles.map(sqiFile => {
            const fileNameWithoutExtension = sqiFile.replace('.json', '');
            const sqiName = fileNameWithoutExtension.split(/(?=[A-Z])/g).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
            return sqiName;
        });
        
        
    } catch(error) {
        console.log(`There was an error while executing /listsqi, error: ${error}`);
    }
};

export default command;