import { SlashCommandBuilder } from "discord.js";
import { createRosterEmbed, createMessageEmbed } from "../../embeds/index.js";
import { getRosterRoles } from "../../utils/general.js";
import { Roster, RosterRole } from "../../models/index.js";
import { DateTime } from "luxon"; 

const command = new SlashCommandBuilder()
    .setName('roster')
    .setDescription('Creates a new roster/run for the desired channel')
command.aliases = ['r', 'roster'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;
    

    await runCommand(send, guild, embedColor, interaction);
};

async function runCommand(send, guild, embedColor, interaction) {
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
            send({ embeds: 
                [createMessageEmbed(
                    'No roster found', 
                    'There is no roster settled in this channel', 
                    embedColor, 
                    '❌',
                    "Use /setroster command to setup a new roster in this channel\n You can also try using /rosterhelp for extra information"
                )]
            });
        } else {
            const organizedByUser = await interaction.client.users.fetch(roster.dataValues.organized_by);
            const rosterRoles = await roster.roles;
            const mainRoles = await getRosterRoles(rosterRoles, 'main');
            const reserveRoles = await getRosterRoles(rosterRoles, 'reserve');
            
            const rosterDateUTC = roster.dataValues.roster_date;
            const serverTime = DateTime.fromJSDate(rosterDateUTC, { zone: 'utc'}).setZone('America/Los_Angeles');
            const MM_DD_YY_FORMAT = serverTime.isValid ? serverTime.toFormat('cccc, LLLL dd/yyyy') : null;
            const HH_MM_FORMAT = serverTime.isValid ? serverTime.toFormat('HH:mm a') : null;
            const timeStampInSeconds = roster.dataValues.roster_date ? Math.floor(roster.dataValues.roster_date.getTime() / 1000) : null;

            send({ embeds: 
                [createRosterEmbed(
                    `${roster.dataValues.roster_name}`, 
                    `${roster.dataValues.thumbnail ? roster.dataValues.thumbnail : ''}`,
                    { name: `Organized by ${organizedByUser.tag}`, iconURL: organizedByUser.displayAvatarURL({ dynamic: true, size: 1024 }) },
                    `***Main***
                    ${mainRoles}\n
                    ***Reserve***
                    ${reserveRoles}\n
                    Server Date: ${MM_DD_YY_FORMAT ? MM_DD_YY_FORMAT : '`Not defined yet`'}
                    Server Time: ${HH_MM_FORMAT ? HH_MM_FORMAT : '`Not defined yet`'}
                    Your time: ${timeStampInSeconds ? `<t:${timeStampInSeconds}:F>` : '`Not defined yet`'}
                    ${timeStampInSeconds ? `That's <t:${timeStampInSeconds}:R> for you` : ''}`,
                    `Note: ${roster.dataValues.roster_note}\n\n- Roster commands -\n/addposition: add self or another user to the roster options[position, user, random]\n/removeposition: removes self if no parameters given or another position or user from the roster options[position]\n/editrole: edit the role of the position given as parameter options[new-role, position]\n/swapposition: swap 2 positions given as parameters options[positon-1, position-2]\n\nMore commands: /noteposition, /pingroster\nManagement commands: /setroster, /deleteroster, /clearroster, /nextweekroster, /editroster\n\nFor a full list of roster related commands and their usage use /rosterhelp`,
                    embedColor, 
                )]
            });
        };
    } catch (error) {
        console.log(error);
        send({ embeds:
            [createMessageEmbed(
                "Error",
                "There was an error while executing this command!",
                embedColor,
                "❌"
            )]
        });
    };
};

export default command;

