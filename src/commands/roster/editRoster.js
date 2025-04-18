import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Roster, RosterRole } from "../../models/index.js";
import { formatRosterDate, isValidUrl } from "../../utils/general.js";
import { DateTime } from 'luxon';

const command = new SlashCommandBuilder()
    .setName('editroster')
    .setDescription('Edits the roster of this channel')
    .addStringOption((option) => option
        .setName('new-name')
        .setDescription('Input the new name of the roster/run e.g Mystic Tower => Mystic Run')
        .setRequired(false)
    )
    .addIntegerOption((option) => option
        .setName('new-members-amount')
        .setDescription('Input the new amount of members in the roster/run min of 4, max of 12')
        .setMinValue(4)
        .setMaxValue(12)
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('new-date')
        .setDescription('Input the new date of the roster/run, e.g 12/20 (month/day)')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('new-time')
        .setDescription('Input the new time of the roster/run, e.g 10:00 (hour:min)')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('new-thumbnail')
        .setDescription('Input the new external URL for the thumbnail of the roster/run')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('new-note')
        .setDescription('Input a new note of the roster/run')
        .setRequired(false)
    )
command.aliases = ['er', 'editroster'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = interaction.guild;
    const embedColor = client.config.embedColor;
    const newName = interaction.options.getString('new-name');
    const newMembersAmount = interaction.options.getInteger('new-members-amount');
    const newRosterDate = interaction.options.getString('new-date');
    const newRosterTime = interaction.options.getString('new-time');
    const newThumbnail = interaction.options.getString('new-thumbnail');
    const newNote = interaction.options.getString('new-note');
    const newFormattedRosterDate = formatRosterDate(newRosterDate, newRosterTime, DateTime);

    await runCommand(
        send, 
        guild, 
        embedColor, 
        newName, 
        newMembersAmount, 
        newRosterDate, 
        newRosterTime, 
        newFormattedRosterDate, 
        newThumbnail, 
        newNote, 
        interaction
    );
};

async function runCommand(
    send, 
    guild, 
    embedColor, 
    newName, 
    newMembersAmount, 
    newRosterDate, 
    newRosterTime, 
    newFormattedRosterDate, 
    newThumbnail, 
    newNote, 
    interaction
) {
    try {
        const defaultRoles = [
            'Tank', 'Pally', 'HP', 'HP', 'HW', 'Bio', 'DPS', 'DPS', 'DPS', 'DPS', 'Clown', 'Gypsy'
        ];
        const reserveRoles = [
            'Reserve', 'Reserve', 'Reserve', 'Reserve'
        ];
        
        if((newRosterDate || newRosterTime) && !newFormattedRosterDate) {
            await send({ embeds: [
                createMessageEmbed(
                    'Invalid date or time input', 
                    'Please make sure to input both new-date and new-time correctly in MM/DD HH:MM format to schedule a run', 
                    embedColor, 
                    '❌'
                )] 
            });

            return;
        };

        if(newThumbnail && !isValidUrl(newThumbnail)) {
            await send({ embeds: 
                [createMessageEmbed(
                    'Invalid thumbnail input', 
                    'Please make sure to input a valid URL for the thumbnail', 
                    embedColor, '❌'
                )] 
            });

            return;
        };

        const roster = await Roster.findOne({
            where: {
                guild_id: guild.id,
                channel_id: interaction.channelId
            }
        });
        
        if(!roster) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed', 
                    'There is no roster settled in this channel', 
                    embedColor, 
                    '❌'
                )] 
            });

            return;
        };

        if(newMembersAmount && (newMembersAmount !== roster.members_amount)) {
            roster.members_amount = newMembersAmount;
            await roster.save();
            
            const existingRoles = await RosterRole.findAll({
                where: {
                    roster_id: roster.id,
                },
                order: [['role_position', 'ASC']]
            });
            
            const assignedUsers = existingRoles.map((role) => role.assigned_user);
            const roleNotes = existingRoles.map((role) => role.role_note);

            await RosterRole.destroy({
                where: {
                    roster_id: roster.id,
                }
            });
            const newRoles = defaultRoles.slice(0, newMembersAmount).map((roleName, index) => ({
                roster_id: roster.id,
                role_name: roleName,
                assigned_user: assignedUsers[index] || null,
                role_note: roleNotes[index] || null,
                role_position: `${index + 1}`,
                role_type: 'main',
            }));
            const newReserveRoles = reserveRoles.slice(0, newMembersAmount).map((roleName, index) => ({
                roster_id: roster.id,
                role_name: roleName,
                assigned_user: null,
                role_note: null,
                role_position: `${newMembersAmount + index + 1}`,
                role_type: 'reserve',
            }));

            await RosterRole.bulkCreate([...newRoles, ...newReserveRoles]);
            await send({ embeds: [
                createMessageEmbed(
                    'Roster updated', 
                    'The roster has been updated successfully', 
                    embedColor, 
                    '✅'
                )
            ]});

            return;
        };

        const rolesToUpdate = {
            ...(newName && { roster_name: newName }),
            ...(newRosterDate && { roster_date: newFormattedRosterDate }),
            ...(newThumbnail && { thumbnail: newThumbnail }),
            ...(newNote && { roster_note: newNote })
        };

        if(Object.keys(rolesToUpdate).length === 0) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed', 
                    'No changes were made to the roster', 
                    embedColor, 
                    '❌'
                )] 
            });

            return;
        };

        await roster.update(rolesToUpdate);
        await send({ embeds: [
            createMessageEmbed(
                'Roster updated', 
                'The roster has been updated successfully', 
                embedColor, 
                '✅'
            )
        ]});
    } catch (error) {
        console.error(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed', 
                'Something went wrong while trying to create a new roster', 
                embedColor, 
                '❌'
            )] 
        });
    };
};

export default command;