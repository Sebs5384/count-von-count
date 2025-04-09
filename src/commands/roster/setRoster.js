import { SlashCommandBuilder } from "discord.js";
import { Roster, RosterRole } from "../../models/index.js";
import { createMessageEmbed } from "../../embeds/index.js";

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
    const thumbnail = interaction.options.getString('thumbnail');
    const note = interaction.options.getString('note');

    await runCommand(send, guild, embedColor, rosterName, membersAmount, thumbnail, note, interaction);
};

async function runCommand(send, guild, embedColor, rosterName, membersAmount, thumbnail, note, interaction) {
    try {
        const defaultRoles = ['01: Tank', '02: Pally', '03: HP', '04: HP', '05: HW', '06: Bio', '07: DPS', '08: DPS', '09: DPS', '10: DPS', '11: Flex', '12: Flex'];

        const rosterInChannel = await Roster.findOne({
            where: {
                guild_id: guild.id,
            }
        });

        if(rosterInChannel) {
            await send({ embeds: [createMessageEmbed('Roster already exists in this channel', 'Please remove the existing roster before creating a new one', embedColor, '❌')] });
        } else {
            const [createdRoster, created] = await Roster.findOrCreate({
                where: {
                    guild_id: guild.id
                },
                defaults: {
                    roster_name: rosterName,
                    member_amount: membersAmount,
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
                role_position: `${index + 1}`
            }));

            await RosterRole.bulkCreate(rolesToCreate);

            await send({ embeds: [
                createMessageEmbed(
                    'Roster created', 
                    `Successfully created a new roster with the following specs\n
                    Name: **${createdRoster.roster_name}**\n
                    Amount of members: **${createdRoster.member_amount}**\n
                    Thumbnail: **${createdRoster.thumbnail ? `[Click here to see thumbnail](${createdRoster.thumbnail})` : 'None'}**\n
                    Note: **${createdRoster.roster_note ? createdRoster.roster_note : 'None'}**\n
                    Organized by: <@${createdRoster.organized_by}>`, 
                    embedColor, 
                    '✅'
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