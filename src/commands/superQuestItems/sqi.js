import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createSqiEmbed } from "../../embeds/index.js";
import { createSuperQuestItemButtonsRow } from "../../rows/index.js";
import { 
    findMatchingFile, 
    findMatchingFileByInitials,
    getSuperQuestItemData, 
    getSqiMainStatFields, 
    getSqiIngredientFields, 
    getSqiBonusFields, 
    getCurrentButtons 
} from "../../utils/general.js";
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

    await runCommand(send, guild, embedColor, sqiName, interaction);
};

async function runCommand(send, guild, embedColor, sqiName, interaction) {
    try {
        const sqiFiles = fs.readdirSync('src/data/sqi');
        const matchingInitials = findMatchingFileByInitials(sqiFiles, sqiName);
        const matchingFileName = findMatchingFile(sqiFiles, sqiName);
    

        if(matchingFileName || matchingInitials) {
            const matchingFile = matchingFileName || matchingInitials;
            const filePath = `src/data/sqi/${matchingFile}`;
            const sqiFile = fs.readFileSync(filePath, 'utf8');
            const sqi = JSON.parse(sqiFile);

            const sqiData = getSuperQuestItemData(sqi);
            const sqiFields = getSqiMainStatFields(sqiData);
            const sqiIngredients = getSqiIngredientFields(sqiData);
            const sqiBonuses = getSqiBonusFields(sqiData);
            const sqiEmbed = createSqiEmbed(sqiData, sqiFields, embedColor);
            const embedButtons = getCurrentButtons('sqidescription');
            const sqiEmbedButtons = createSuperQuestItemButtonsRow(embedButtons);

            const message = await send({ embeds: [sqiEmbed], components: [sqiEmbedButtons] });
            
            try {
                const userInteractionFilter = (i) => i.user.id === interaction.user.id;
                const THREE_MINUTES = 180000;
                const collector = message.createMessageComponentCollector({ filter: userInteractionFilter, time: THREE_MINUTES });

                collector.on('collect', async (button) => {
                    if(button.customId === 'sqiingredients') {
                        const sqiEmbed = createSqiEmbed(sqiData, sqiIngredients, embedColor);
                        const embedButtons = getCurrentButtons('sqiingredients');
                        const sqiEmbedButtons = createSuperQuestItemButtonsRow(embedButtons);

                        message.edit({ embeds: [sqiEmbed], components: [sqiEmbedButtons] });
                        await button.deferUpdate();
                    } else if(button.customId === 'sqibonuses') {
                        const sqiEmbed = createSqiEmbed(sqiData, sqiBonuses, embedColor);
                        const embedButtons = getCurrentButtons('sqibonuses');
                        const sqiEmbedButtons = createSuperQuestItemButtonsRow(embedButtons);

                        message.edit({ embeds: [sqiEmbed], components: [sqiEmbedButtons] });
                        await button.deferUpdate();
                    } else if(button.customId === 'sqidescription') {
                        const sqiEmbed = createSqiEmbed(sqiData, sqiFields, embedColor);
                        const embedButtons = ['sqiingredients', 'sqibonuses'];
                        const sqiEmbedButtons = createSuperQuestItemButtonsRow(embedButtons);

                        message.edit({ embeds: [sqiEmbed], components: [sqiEmbedButtons] });
                        await button.deferUpdate();
                    };
                });

                collector.on('end', async (collected, reason) => {
                    if(reason === 'time') {
                        try{
                            await message.edit({ components: [] });
                        } catch(error) {
                            console.log(`There was an error while deleting the sqi buttons: ${error}`);
                        };
                    };
                });


            } catch(error) {
                console.log(`There was an error while creating the collector: ${error}`);
            }
            
            
        } else {
            const noSqiFoundTitle = 'No SQI found';
            const noSqiFoundMessage = `Please check if the name you entered is correct, reading: ${sqiName}`;
            const noSqiFoundFooter = 'Check /help for more information';
            send({ embeds: [createMessageEmbed(noSqiFoundTitle, noSqiFoundMessage, embedColor, '❌', noSqiFoundFooter)] });
        };

    } catch(error) {
        console.log(`There was an error while executing /sqi: ${error}`);
        
        const errorTitle = 'An error ocurred while using /sqi';
        const errorMessage = 'Please try again later';
        const errorFooter = 'Check /help for more information';
        send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
    };
};

export default command;