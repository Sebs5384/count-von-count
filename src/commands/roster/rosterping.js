import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Roster, RosterRole } from "../../models/index.js";
import { DateTime } from "luxon";

const command = new SlashCommandBuilder()
    .setName('rosterping')
    .setDescription('Pings all members in the roster of this channel')
    .addStringOption((option) => option
        .setName('message')
        .setDescription('Input the message you want to send through the ping')
        .setRequired(false)
    ) 
command.aliases = ['rp', 'rosterping'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;
    const message = interaction.options.getString('message');

    await runCommand(send, guild, embedColor, message, interaction);
};

async function runCommand(send, guild, embedColor, message, interaction) {
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

    const rosterRoles = await roster.roles;

    if(!rosterRoles || !rosterRoles.length) {
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'There is no members in the roster of this channel',
                embedColor,
                '❌',
                'Use /addposition command to add members to the roster\n You can also try using /rosterhelp for extra information',
            )
        ]});

        return;
    };

    const mentions = rosterRoles.map((role) => role.assigned_user).filter(userId => userId).map(userId => `<@${userId}>`).join(', ')
    const rosterDateUTC = roster.dataValues.roster_date;
    const serverTime = DateTime.fromJSDate(rosterDateUTC, { zone: 'utc'}).setZone('America/Los_Angeles');
    const MM_DD_YY_FORMAT = serverTime.isValid ? serverTime.toFormat('cccc, LLLL dd/yyyy') : null;
    const HH_MM_FORMAT = serverTime.isValid ? serverTime.toFormat('HH:mm a') : null;
    const timeStampInSeconds = roster.dataValues.roster_date ? Math.floor(roster.dataValues.roster_date.getTime() / 1000) : null;
    
    if(mentions) {
        await send({ embeds: [
            createMessageEmbed(
                `${roster.roster_name}`,
                `Server Date: ${MM_DD_YY_FORMAT}\nServer Time: ${HH_MM_FORMAT}\nThat's <t:${timeStampInSeconds}:R> for you\nRoster Note: \`${roster.roster_note}\`\n\nFrom <@${interaction.user.id}>: ${message ? message : `The run is starting soon !`}`,
                embedColor,
                '📢',
                null,
                roster.thumbnail ? roster.thumbnail : null
            )
        ]});

        await interaction.channel.send({
            content: mentions,
            allowedMentions: {
                users: rosterRoles.map((role) => role.assigned_user).filter(userId => userId)
            }
        });

        return;
    } else {
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'There is no one to ping in this roster',
                embedColor,
                '❌',
                'Use /addposition command to add members to the roster\n You can also try using /rosterhelp for extra information',
            )
        ]});

        return;
    };
};

export default command;