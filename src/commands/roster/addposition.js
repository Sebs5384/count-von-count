import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { getRosterRoles } from "../../utils/general.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('addposition')
    .setDescription('Add a new member to the desired position into the roster of this channel')
    .addStringOption((option) => option
        .setName('position')
        .setDescription('Input the position of the member you want to add e.g 1, required field')
        .setRequired(true)
    )
    .addUserOption((option) => option
        .setName('user')
        .setDescription('Input the user you want to add e.g @roster-member')
        .setRequired(false)
    )
command.aliases = ['ap', 'addposition'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const position = interaction.options.getString('position');
    const userOption = interaction.options.getUser('user');
    
    await runCommand(client, send, guild, embedColor, position, userOption, interaction);
};

async function runCommand(client, send, guild, embedColor, position, userOption, interaction) {
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

        const rosterRole = await roster.roles.find(role => role.dataValues.role_position === position);
        if(!rosterRole) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    `There is no position with the number "${position}" in this roster
                    - Available positions in this roster\n${roster.roles.filter(role => !role.assigned_user).map((role) => `\`${role.role_position}\`: ${role.role_name}`).join('\n')}`,
                    embedColor,
                    '❌',
                    "Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands"
                    `${roster.thumbnail ? `\nThumbnail: ${roster.thumbnail}` : ''}`
                )]
            });

            return;
        };

        if(rosterRole.assigned_user) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    `This position is already taken by <@${rosterRole.assigned_user}>
                    - Available positions in this roster\n${roster.roles.filter(role => !role.assigned_user).map((role) => `\`${role.role_position}\`: ${role.role_name}`).join('\n')}`,
                    embedColor,
                    '❌',
                    "Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands",
                    `${roster.thumbnail ? roster.thumbnail : ''}`
                )]
            });

            return;
        };

        if(rosterRole && userOption && position) {
            await rosterRole.update({ assigned_user: userOption.id });
            const rosterRoles = await roster.roles;
            const mainRoles = await getRosterRoles(rosterRoles, 'main');
            const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');   

            await send({ embeds: [
                createMessageEmbed(
                    'Added successfully',
                    `You have successfully added <@${userOption.id}> to the position \`${position}-${roster.roles.find(role => role.dataValues.role_position === position)?.role_name}\`\n
                    ***Main***
                    ${mainRoles}\n
                    ***Reserve***
                    ${reserveRoles}\n`,
                    embedColor,
                    '✅',
                    "Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands",
                    `${roster.thumbnail ? roster.thumbnail : ''}`
                )]
            });
        };


        if(rosterRole && position) {
            await rosterRole.update({ assigned_user: interaction.user.id });
            const rosterRoles = await roster.roles;
            const mainRoles = await getRosterRoles(rosterRoles, 'main');
            const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');   

            await send({ embeds: [
                createMessageEmbed(
                    'Added successfully',
                    `You have been successfully added to the position \`${position}-${roster.roles.find(role => role.dataValues.role_position === position)?.role_name}\`\n
                    ***Main***
                    ${mainRoles}\n
                    ***Reserve***
                    ${reserveRoles}\n`,
                    embedColor,
                    '✅',
                    "Use /roster command for more information about this run\nYou may want to use /rosterhelp for full details of roster commands",
                    `${roster.thumbnail ? roster.thumbnail : ''}`
                )]
            });
        };

    } catch (error) {
        console.error(error)
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to add a position',
                embedColor,
                '❌'
            )]
        });
    };
};

export default command;

