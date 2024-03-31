import { SlashCommandBuilder } from "discord.js";
import { createListEmbed } from "../../embeds/index.js";
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
        const sqiNames = getFilesName(sqiFiles, '.json');
        const sqis = sqiNames.map(sqi => {
            return {
                name: 'SQI LIST',
                value: `${sqi}`
            }
        })
        const sqiListTitle = 'Super Quest Items';
        const sqiListIcon = 'https://talontales.com/wiki/images/d/d2/Mob27279.gif'
        const sqiListDescription = 'List of all SQI items in the game';
        const sqiListFooter = 'You can check each SQI by using /sqi <sqi name>';
        const embed = createListEmbed(sqiListTitle, sqiListIcon, sqiListDescription, sqis, embedColor, sqiListFooter);
        send({ embeds: [embed] });        
    } catch(error) {
        console.log(`There was an error while executing /listsqi, error: ${error}`);
    }
};

function getFilesName(files, extension) {
    const fileNames = files.map(file => {
        const fileNameWithoutExtension = file.replace(extension, '');
        const fileName = fileNameWithoutExtension.split(/(?=[A-Z])/g).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');

        return fileName;
    });

    return fileNames;
};

export default command;