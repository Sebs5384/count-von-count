import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getRosterRoles } from "../../utils/general.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('removeposition')
    .setDescription('Remove a member from the desired position in the roster of this channel')
    .addStringOption((option) => option
        .setName('position')
        .setDescription('Input the position you want to remove e.g 1, required field')
        .setRequired(false)
    )
command.aliases = ['rp', 'removeposition'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const position = interaction.options.getString('position');
    
    await runCommand(client, send, guild, embedColor, position, interaction);
};

async function runCommand(client, send, guild, embedColor, position, interaction) {
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
                    'Use /setroster command to setup a new roster in this channel\n You can also try using /rosterhelp for extra information',
                )]
            });
        };

        if(!position) {
            const assignedRole = roster.roles.find((role) => role.dataValues.assigned_user === interaction.user.id);
            const rolePosition = assignedRole.dataValues.role_position;
            const roleName = roster.roles.find(role => role.dataValues.role_position === rolePosition)?.role_name;

            if(!assignedRole) {
                await send({ embeds: [
                    createMessageEmbed(
                        'Command failed',
                        'You are not assigned to a position in this roster',
                        embedColor,
                        '❌',
                        'Use /addposition command to add yourself up or others to the roster',
                    )]
                });
            };

            assignedRole.assigned_user = null;
            await assignedRole.save();
            const rosterRoles = await roster.roles;
            const mainRoles = await getRosterRoles(rosterRoles, 'main');
            const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');

            await send({ embeds: [
                createMessageEmbed(
                    'Removed successfully',
                    `You have been successfully removed from the position \`${rolePosition}-${roleName}\`\n
                    ***Main***
                    ${mainRoles}\n
                    ***Reserve***
                    ${reserveRoles}\n`,
                    embedColor,
                    '✅',
                    'Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands',
                    `${roster.thumbnail ? roster.thumbnail : null}`,
                )]
            });
        };

        if(position) {
            const rosterPosition = await roster.roles.find(role => role.dataValues.role_position === position);
            const roleName = rosterPosition?.role_name;
            const assignedUser = rosterPosition?.assigned_user;

            if(!rosterPosition) {
                await send({ embeds: [
                    createMessageEmbed(
                        'Command failed',
                        `There is no position with the number \`${position}\` in this roster\n
                        Use /roster command to see all the available positions`,
                        embedColor,
                        '❌',
                        'Use /addposition command to add yourself up or others to the roster',
                    )]
                });
            };

            rosterPosition.assigned_user = null;
            await rosterPosition.save();
            const rosterRoles = await roster.roles;
            const mainRoles = await getRosterRoles(rosterRoles, 'main');
            const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');

            await send({ embeds: [
                createMessageEmbed(
                    'Removed successfully',
                    `You have successfully removed <@${assignedUser}> from the position \`${position}-${roleName}\`\n
                    ***Main***
                    ${mainRoles}\n
                    ***Reserve***
                    ${reserveRoles}\n`,
                    embedColor,
                    '✅',
                    'Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands',
                    `${roster.thumbnail ? roster.thumbnail : null}`,
                )
            ]})
        };
    } catch (error) {
        console.error(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to remove a position',
                embedColor,
                '❌'
            )]
        });
    };
};

export default command;