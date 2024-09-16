import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed, createMonsterEmbed } from "../../embeds/index.js";
import { findMatchingName, findMatchingInitials } from "../../utils/general.js";
import fs from "fs";
import path from "path";

const command = new SlashCommandBuilder()
    .setName('missionmonster')
    .setDescription('Displays the desired monster information for the summer race monster finding mission')
    .addStringOption((option) => option
        .setName('monster-name')
        .setDescription('Input the name of the monster to be find')
        .setRequired(true)
    )
command.aliases = ['missionmonster', 'mmonster', 'monster'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const monsterName = interaction.options.getString('monster-name');

    await runCommand(send, guild, embedColor, monsterName, interaction);
};

async function runCommand(send, guild, embedColor, monsterName, interaction) {
    try {   
        const filePath = path.join('src', 'data', 'race', 'monster.json');
        const monsterFile = fs.readFileSync(filePath, 'utf8');
        const monsters = JSON.parse(monsterFile);
        const monsterNames = monsters.map((monster) => monster.name);
        const matchingInitials = findMatchingInitials(monsterNames, monsterName);
        const matchingName = findMatchingName(monsterNames, monsterName);

        if(matchingInitials || matchingName) {
            const selectedMonster = monsters.find((monster) => monster.name === matchingName);
            const monsterName = selectedMonster.name;
            const monsterMap = selectedMonster.map;
            const monsterQuantity = selectedMonster.quantity.toString();
            const monsterSprite = selectedMonster.monsterSprite;
            const mapImage = selectedMonster.mapImage;
            const mapLink = selectedMonster.mapLink;
            const missionAmount = selectedMonster.missionAmount.toString();
            const monsterSpawnWindow = selectedMonster.spawnWindow;
            const monsterPath = selectedMonster.path;

            send({ embeds: [createMonsterEmbed(monsterName, monsterMap, monsterQuantity, monsterSprite, mapImage, mapLink, missionAmount, monsterSpawnWindow, monsterPath, embedColor)] });
        }

    } catch(error) {
        console.error(error);
    };
};

export default command;