import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
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
        
        for(const npc of npcs) {

            if(matchingInitials || matchingName) {
                const npcName = npc.name;
                const npcMap = npc.map;

                send({ embeds: [createMessageEmbed(npcName, npcMap, embedColor)]});
            };
        };
    } catch(error) {
        console.log(`There was an error while executing /racenpc: ${error}`);
    };
};

export default command;