import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createNpcEmbed } from "../../embeds/index.js";
import { findMatchingName, findMatchingInitials } from "../../utils/general.js";
import fs from "fs";
import path from "path";

const command = new SlashCommandBuilder()
    .setName('racenpc')
    .setDescription('Displays the desired NPC information for the summer race NPC finding mission')
    .addStringOption((option) => option
        .setName('npc-name')
        .setDescription('Input the name of the NPC to be find')
        .setRequired(true)
    )
command.aliases = ['racenpc', 'rnpc', 'npc'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const npcName = interaction.options.getString('npc-name');

    await runCommand(send, guild, embedColor, npcName, interaction);
};

async function runCommand(send, guild, embedColor, npcName, interaction) {
    try {
        const filePath = path.join('src', 'data', 'race', 'npc.json');
        const npcFile = fs.readFileSync(filePath, 'utf8');
        const npcs = JSON.parse(npcFile);
        const npcNames = npcs.map((npc) => npc.name);
        const matchingInitials = findMatchingInitials(npcNames, npcName);
        const matchingName = findMatchingName(npcNames, npcName);
        
        if(matchingInitials || matchingName) {
            const selectedNpc = npcs.find((npc) => npc.name === matchingName);
            const npcName = selectedNpc.name;
            const npcMap = selectedNpc.map;
            const npcMapLink = selectedNpc.mapLink;
            const npcMapImage = selectedNpc.mapImage;
            const npcNpcImage = selectedNpc.npcImage;
            const npcPath = selectedNpc.path;

            send({ embeds: [createNpcEmbed(npcName, npcMap, npcMapLink, npcMapImage, npcNpcImage, npcPath, embedColor)] });
        } else {
            send({ embeds: [createMessageEmbed('Error', `No NPC found with the name ${npcName}`, embedColor, '❌')] });
        }
    } catch(error) {
        console.error(error);
    };
};

export default command;