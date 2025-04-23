import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getRosterRoles } from "../../utils/general.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('swapposition')
    .setDescription('Swap two users in the desired positions in the roster of this channel')
    .addStringOption((option) => option
        .setName('position-1')
        .setDescription('Input the position of the first user you want to swap e.g 1, required field')
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('position-2')
        .setDescription('Input the position of the second user you want to swap e.g 2, required field')
        .setRequired(true)
    )
command.aliases = ['sp', 'swapposition'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const position1 = interaction.options.getString('position-1');
    const position2 = interaction.options.getString('position-2');

    await runCommand(client, send, guild, embedColor, position1, position2, interaction);
};

async function runCommand(client, send, guild, embedColor, position1, position2, interaction) {
    try {
        const roster = await Roster.findOne({
            where: {
                guild_id: guild.id,
                channel_id: interaction.channelId,
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
                    'Use /setroster command to setup a new roster in this channel\n You can also try using /rosterhelp for extra information',
                )
            ]});
        };

        const rosterRoles = await roster.roles;
        const rosterPosition1 = await rosterRoles.find((role) => role.dataValues.role_position === position1);
        const rosterPosition2 = await rosterRoles.find((role) => role.dataValues.role_position === position2);
        const previousPosition1User = rosterPosition1?.assigned_user;
        const previousPosition2User = rosterPosition2?.assigned_user;
        const noPositions = !rosterPosition1 && !rosterPosition2;
        const unexistingPosition = !rosterPosition1 ? position1 : !rosterPosition2 ? position2 : null;
        const mainAvailablePositions = await getRosterRoles(rosterRoles, 'main');
        const reserveAvailablePositions = await getRosterRoles(rosterRoles, 'reserve');

        if(noPositions) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    `Position \`${position1}\` and position \`${position2}\` do not exist in this roster\n\nAvailable positions in this roster\n\n***Main***\n${mainAvailablePositions}\n\n***Reserve***\n${reserveAvailablePositions}\n`,
                    embedColor,
                    '❌',
                    'Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands',
                    roster.thumbnail ? roster.thumbnail : null
                )
            ]});

            return;
        };

        if(unexistingPosition) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    `Position \`${unexistingPosition}\` does not exist in this roster\n\nAvailable positions in this roster\n\n***Main***\n${mainAvailablePositions}\n\n***Reserve***\n${reserveAvailablePositions}\n`,
                    embedColor,
                    '❌',
                    'Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands',
                    roster.thumbnail ? roster.thumbnail : null
                )
            ]});

            return;
        };

        if(previousPosition1User === previousPosition2User) {
            await send({ embeds: [
                createMessageEmbed(
                    'Wrong usage of command',
                    `You cannot swap users in the same position\n\nReading: \`${position1}-${rosterPosition1.role_name}\`-<@${previousPosition1User}> and \`${position2}-${rosterPosition2.role_name}\`-<@${previousPosition2User}>`,
                    embedColor,
                    '❌',
                    'Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands',
                )
            ]});

            return;
        };

        await rosterPosition1.update({ assigned_user: previousPosition2User });
        await rosterPosition2.update({ assigned_user: previousPosition1User });
        const mainRoles = await getRosterRoles(rosterRoles, 'main');
        const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');

        await send({ embeds: [
            createMessageEmbed(
                'Swapped successfully',
                `Successfully swapped users in positions:\n\`${position1}-${rosterPosition1.role_name}\`-<@${previousPosition1User}> and \`${position2}-${rosterPosition2.role_name}\`-<@${previousPosition2User}>\nto\n \`${position1}-${rosterPosition1.role_name}\`-<@${previousPosition2User}> and \`${position2}-${rosterPosition2.role_name}\`-<@${previousPosition1User}>\n\n***Main***\n${mainRoles}\n\n***Reserve***\n${reserveRoles}\n`,
                embedColor,
                '✅',
                'Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands',
                roster.thumbnail ? roster.thumbnail : null
            )
        ]});
    } catch (error) {
        console.error(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to swap users in the roster',
                embedColor,
                '❌',
            )
        ]});
    };
};

export default command;