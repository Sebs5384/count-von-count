import { SlashCommandBuilder } from "discord.js";
import { Roster, RosterRole } from "../../models/index.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { formatRosterDate, isValidUrl } from "../../utils/general.js";
import { DateTime } from "luxon";

const command = new SlashCommandBuilder()
    .setName('setroster')
    .setDescription('Sets a new roster/run on the desired channel')
    .addStringOption((option) => option
        .setName('roster-name')
        .setDescription('Input the name of the roster/run e.g Mystic Tower, required field')
        .setMaxLength(25)
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName('members-amount')
        .setDescription('Input the amount of members in the roster/run min of 4, max of 12')
        .setMinValue(4)
        .setMaxValue(12)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('date')
        .setDescription('Input the date of the roster/run, e.g 12/20 (month/day)')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('time')
        .setDescription('Input the time of the roster/run, e.g 10:00 (hour:min)')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('thumbnail')
        .setDescription('Input an external URL for the thumbnail of the roster/run')
        .setRequired(false)
    )
    .addStringOption((option) => option
        .setName('note')
        .setDescription('Leave a note for the roster/run')
        .setRequired(false)
    );
command.aliases = ['setroster, sr, roster'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;
    const rosterName = interaction.options.getString('roster-name');
    const membersAmount = interaction.options.getInteger('members-amount');
    const rosterDate = interaction.options.getString('date');
    const rosterTime = interaction.options.getString('time');
    const thumbnail = interaction.options.getString('thumbnail');
    const note = interaction.options.getString('note');
    const formattedRosterDate = formatRosterDate(rosterDate, rosterTime, DateTime);

    await runCommand(send, guild, embedColor, rosterName, membersAmount, rosterDate, rosterTime, formattedRosterDate, thumbnail, note, interaction);
};

async function runCommand(send, guild, embedColor, rosterName, membersAmount, rosterDate, rosterTime, formattedRosterDate, thumbnail, note, interaction) {
    try {
        const defaultRoles = [
            'Tank', 'Pally', 'HP', 'HP', 'HW', 'Bio', 'DPS', 'DPS', 'DPS', 'DPS', 'Clown', 'Gypsy'
        ];
        const reserveRoles = [
            'Reserve', 'Reserve', 'Reserve', 'Reserve'
        ];

        if((rosterDate || rosterTime) && !formattedRosterDate) {
            await send({ embeds: 
                [createMessageEmbed(
                    'Invalid date or time input', 
                    'Please make sure to input both date and time correctly to schedule a run', 
                    embedColor, '❌'
                )] 
            });
            return;
        };

        if(thumbnail && !isValidUrl(thumbnail)) {
            await send({ embeds: 
                [createMessageEmbed(
                    'Invalid thumbnail input', 
                    'Please make sure to input a valid URL for the thumbnail', 
                    embedColor, '❌'
                )] 
            });
            return;
        };

        const rosterInChannel = await Roster.findOne({
            where: {
                guild_id: guild.id,
                channel_id: interaction.channelId
            }
        });

        if(rosterInChannel) {
            await send({ embeds: 
                [createMessageEmbed(
                    'Roster already exists in this channel', 
                    'Please remove the existing roster before creating a new one', 
                    embedColor, '❌'
                )] 
            });
        } else {
            const [createdRoster, created] = await Roster.findOrCreate({
                where: {
                    guild_id: guild.id,
                    channel_id: interaction.channelId
                },
                defaults: {
                    roster_name: rosterName,
                    member_amount: membersAmount,
                    roster_date: formattedRosterDate,
                    thumbnail: thumbnail,
                    roster_note: note,
                    organized_by: interaction.user.id,
                    guild_id: guild.id,
                    channel_id: interaction.channelId
                }
            });

            const rolesToCreate = defaultRoles.slice(0, membersAmount).map((roleName, index) => ({
                roster_id: createdRoster.id,
                role_name: roleName,
                assigned_user: '',
                role_position: `${index + 1}`,
                role_type: 'main'
            }));

            const reserveRolesToCreate = reserveRoles.map((roleName, index) => ({
                roster_id: createdRoster.id,
                role_name: roleName,
                assigned_user: '',
                role_position: `${membersAmount + index + 1}`,
                role_type: 'reserve'
            }));

            await RosterRole.bulkCreate([...rolesToCreate, ...reserveRolesToCreate]);

            const isoDate = createdRoster.roster_date ? createdRoster.roster_date.toISOString() : null;
            const DD_MM_YYYY_FORMAT = `${isoDate.slice(5, 7)}/${isoDate.slice(8, 10)}/${isoDate.slice(0, 4)}`;
            
            await send({ embeds: [
                createMessageEmbed(
                    'Roster created', 
                    `Successfully created a new roster with the following specs\n
                    Name: **${createdRoster.roster_name}**\n
                    Amount of members: **${createdRoster.member_amount} members**\n
                    Thumbnail: **${createdRoster.thumbnail ? `[Click here to see thumbnail](${createdRoster.thumbnail})` : 'None'}**\n
                    Date: **${createdRoster.roster_date ? `${DD_MM_YYYY_FORMAT} - ${rosterTime}HS Server Time` : 'None'}**\n
                    Note: **${createdRoster.roster_note ? createdRoster.roster_note : 'None'}**\n
                    Organized by: <@${createdRoster.organized_by}>`, 
                    embedColor, 
                    '✅',
                    'Use /roster command to view the created roster\nYou can also edit this roster positions/size by using /editroster command\nHappy gaming !'
                )] 
            });
        };
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