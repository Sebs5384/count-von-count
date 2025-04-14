import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getRosterRoles } from "../../utils/general.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('editposition')
    .setDescription('Edit the name of the desired position')
    .addStringOption((option) => option
        .setName('position')
        .setDescription('Input the position you want to edit e.g 1, required field')
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('new-name')
        .setDescription('Input the new name of the position e.g Tank => Pally, required field')
        .setRequired(true)
    )
command.aliases = ['rp', 'editposition'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const position = interaction.options.getString('position');
    const newPositionName = interaction.options.getString('new-name');

    await runCommand(client, send, guild, embedColor, position, newPositionName, interaction);
};

async function runCommand(client, send, guild, embedColor, position, newPositionName, interaction) {
    try {
        const roster = await Roster.findOne({
            where: {
                guild_id: guild.id,
                channel_id: interaction.channelId
            },
            include: {
                model: RosterRole, as: 'roles'
            }
        });

        if(!roster) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    'There is no roster settled in this channel',
                    embedColor,
                    '❌',
                    "Use /setroster command to setup a new roster in this channel\n You can also try using /rosterhelp for extra information"
                )]
            });
        };

        const rosterRoles = roster.roles;
        const rosterPosition = await rosterRoles.find((role) => role.dataValues.role_position === position);
        const rolePositionName = rosterPosition?.role_name;
        const mainRoles = await getRosterRoles(rosterRoles, 'main');
        const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');

        if(!rosterPosition) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    `There is no position with the number \`${position}\` in this roster
                    - Available positions in this roster\n
                    ***Main***
                    ${mainRoles}\n
                    ***Reserve***
                    ${reserveRoles}\n
                    `,
                    embedColor,
                    '❌',
                    "Use /roster command for more information about this run\nYou may want to use /rosterhelp for a full details of roster commands",
                )
            ]});

            return;
        };

        await rosterPosition.update({
            role_name: newPositionName
        });

        await send({ embeds: [
            createMessageEmbed(
                'Position edited',
                `The position \`${position}-${rolePositionName}\` has been edited to \`${newPositionName}\``,
                embedColor,
                '✅',
                "Use /roster command for more information about this run\nYou may want to use /rosterhelp for a full details of roster commands",
            )
        ]});
    } catch (error) {
        console.log(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to edit this position',
                embedColor,
                '❌',
                "Use /roster command for more information about this run\nYou may want to use /rosterhelp for a full details of roster commands",
            )
        ]});
    };
};

export default command;