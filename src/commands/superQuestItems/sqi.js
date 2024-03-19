import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const command = new SlashCommandBuilder()
    .setName('sqi')
    .setDescription('Displays the desired SQI item information')
    .addStringOption((option) => option
        .setName('sqi-name')
        .setDescription('Input the name of the SQI item e.g Artemis, required field')
        .setRequired(true)
    )
command.aliases = ['sqi', 'superquestitem'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const sqiName = interaction.options.getString('sqi-name');

    await runCommand(send, guild, embedColor, sqiName);
};

async function runCommand(send, guild, embedColor, sqiName) {
    const sqiFile = fs.readFileSync(`src/data/sqi/${sqiName}.json`, 'utf8');
    const sqiData = JSON.parse(sqiFile);

    console.log(sqiData)
};

function findMatchingFile(files, sqiName) {
    const formattedInput = sqiName.toLowerCase().replace(' ', '');
}

export default command;