import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createSqiEmbed } from "../../embeds/index.js";
import { createSuperQuestItemButtonsRow } from "../../rows/index.js";
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
            const embedButtons = ['sqiingredients', 'sqibonuses'];
            const sqiEmbedButtons = createSuperQuestItemButtonsRow(embedButtons);

            const message = await send({ embeds: [sqiEmbed], components: [sqiEmbedButtons] });
            
            try {
                const userInteractionFilter = (i) => i.user.id === interaction.user.id;
                const THREE_MINUTES = 180000;
                const collector = message.createMessageComponentCollector({ filter: userInteractionFilter, time: THREE_MINUTES });

                collector.on('collect', async (button) => {
                    if(button.customId === 'sqiingredients') {
                        const sqiEmbed = createSqiEmbed(sqiData, sqiIngredients, embedColor);
                        const embedButtons = ['sqibonuses', 'sqidescription'];
                        const sqiEmbedButtons = createSuperQuestItemButtonsRow(embedButtons);

                        message.edit({ embeds: [sqiEmbed], components: [sqiEmbedButtons] });
                        await button.deferUpdate();
                    } else if(button.customId === 'sqibonuses') {
                        const sqiEmbed = createSqiEmbed(sqiData, sqiBonuses, embedColor);
                        const embedButtons = ['sqiingredients', 'sqidescription'];
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

function findMatchingFile(files, input) {
    const inputWords = input.toLowerCase().split(/\s+/);

    for(const file of files) {
        const formattedFileName = file.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace('.json', '');
        let matchFound = false;

        for(const word of inputWords) {
            if(formattedFileName.includes(word)) {
                matchFound = true;
                break;
            }
        };

        if(matchFound) {
            return file;
        };
    };

    return false;
};

function findMatchingFileByInitials(files, input) {
    for(const file of files) {
        const firstInitial = file[0];
        const uppercaseInitials = file.replace(/[^A-Z]/g, '');
        const userInput = input.toLowerCase();
        const intials = (firstInitial + uppercaseInitials).toLowerCase();
        
        if(intials === userInput) {
            return file;
        };
    };

    return false;
};

function getSuperQuestItemData(sqi) {
    return {
        name: sqi.name,
        description: sqi.description,
        stats: sqi.stats,
        itemClass: sqi.itemClass,
        attackStrength: sqi.attackStrength,
        weaponLevel: sqi.weaponLevel,
        defenseRate: sqi.defenseRate,
        weight: sqi.weight,
        requiredLevel: sqi.requiredLevel,
        applicationJobs: sqi.applicationJobs,
        ingredients: sqi.ingredients,
        bonuses: sqi.bonuses,
        image: sqi.image,
        icon: sqi.icon
    };
};

function getSqiMainStatFields(sqi) {
    const mainStatFields = [
        { name: 'Description', value: sqi.description },
        { name: 'Stats', value: sqi.stats.map(stat => `- ${stat}`).join('\n') },
        { name: 'Item Class', value: sqi.itemClass },
        { name: 'Weight', value: sqi.weight },
        { name: 'Required Level', value: sqi.requiredLevel },
        { name: 'Application Jobs', value: sqi.applicationJobs.map(job => `- ${job}`).join('\n') },
    ];

    if(sqi.attackStrength) mainStatFields.splice(3, 0, { name: 'Attack Strength', value: sqi.attackStrength });
    if(sqi.defenseRate) mainStatFields.splice(3, 0, { name: 'Defense Rate', value: sqi.defenseRate });
    if(sqi.weaponLevel) mainStatFields.splice(5, 0, { name: 'Weapon Level', value: sqi.weaponLevel });

    return mainStatFields;
};

function getSqiIngredientFields(sqi) {
    const ingredientFields = [
        { name: 'Crafting Ingredients', value: sqi.ingredients.map(ingredient => `- ${ingredient}`).join('\n') }
    ];

    return ingredientFields;
};

function getSqiBonusFields(sqi) {
    const bonusFields = [];
    const maxFieldLength = 1024;
    const bonuses = sqi.bonuses;
    let currentField = { name: 'Bonuses', value: '' };
    
    if(!bonuses) return [];

    for(const bonus of bonuses) {
        const fieldLength = currentField.value.length + bonus.length;
        
        if(fieldLength > maxFieldLength) {
            bonusFields.push(currentField);
            currentField = { name: '\u00A0', value: ''};

            currentField.value += `- ${bonus}\n`
        } else {
            currentField.value += `- ${bonus}\n`;
        };
        

    };

    if(currentField.value.trim() !== '') {
        bonusFields.push(currentField);
    };

    return bonusFields;
};

export default command;