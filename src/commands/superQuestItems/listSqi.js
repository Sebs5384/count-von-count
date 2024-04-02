import { SlashCommandBuilder } from "discord.js";
import { createListEmbed } from "../../embeds/index.js";
import { getFilesName } from "../../utils/general.js";
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
        const sqis = { name: '\u00A0', value: sqiNames.map(sqiName => `- ${sqiName}`).join('\n') };
        const sqiListTitle = 'Super Quest Items';
        const sqiListIcon = 'https://talontales.com/wiki/images/d/d2/Mob27279.gif'
        const sqiListDescription = 'Below is the list of all the SQI items';
        const sqiListFooter = 'You can check each SQI by using /sqi <sqi name>';
        const listEmbed = createListEmbed(sqiListTitle, sqiListIcon, sqiListDescription, sqis, embedColor, sqiListFooter);
        
        send({ embeds: [listEmbed] });        
    } catch(error) {
        console.log(`There was an error while executing /listsqi, error: ${error}`);
    }
};

export default command;