import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('positionnote')
    .setDescription('Sets at the located position in the roster of this channel')
    .addStringOption((option) => option
        .setName('note')
        .setDescription('Input the note that will be display in your position, required field')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addBooleanOption((option) => option
        .setName('remove-note')
        .setDescription('Removes the note from your position when set to true')
        .setRequired(false)
    )
command.aliases = ['np', 'notep'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = interaction.guild;
    const embedColor = client.config.embedColor;
    const positionNote = interaction.options.getString('note');
    const removeNote = interaction.options.getBoolean('remove-note');

    await runCommand(client, send, guild, positionNote, removeNote, embedColor, interaction);
};

async function runCommand(client, send, guild, positionNote, removeNote, embedColor, interaction) {
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
                )
            ]});

            return;
        };

        const rosterRoles = roster.roles;
        const assignedUser = rosterRoles.find((role) => role.dataValues.assigned_user === interaction.user.id);
        const roleNote = assignedUser?.dataValues.role_note;

        if(!assignedUser) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    'You are not in the roster of this channel',
                    embedColor,
                    '❌',
                    'Use /addposition command to add yourself into the roster of this channel\nYou can also try using /rosterhelp for extra information',
                )
            ]});

            return;
        };

        if(removeNote) {
            await assignedUser.update({ role_note: null });
            await send({ embeds: [
                createMessageEmbed(
                    'Note removed',
                    `Your note has been removed from your position in the roster of this channel`,
                    embedColor,
                    '✅'
                )
            ]});

            return;
        };

        if(roleNote) {
            await assignedUser.update({ role_note: positionNote });
            await send({ embeds: [
                createMessageEmbed(
                    'Note updated',
                    `Your note has been updated to \`${positionNote}\``,
                    embedColor,
                    '✅'
                )
            ]});
            
            return;
        };

        await assignedUser.update({ role_note: positionNote });
        await send({ embeds: [
            createMessageEmbed(
                'Note added',
                `Your note \`${positionNote}\` has been added to your position in the roster`,
                embedColor,
                '✅'
            )
        ]});
    } catch (error) {
        console.error(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to add a note to your position in the roster of this channel',
                embedColor,
                '❌'
            )
        ]});
    };
};

export default command;