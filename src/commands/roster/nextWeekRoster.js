import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Roster, RosterRole } from "../../models/index.js";
import { DateTime } from "luxon";

const command = new SlashCommandBuilder()
    .setName('nextweekroster')
    .setDescription('Creates a new roster/run for the desired channel')
command.aliases = ['nwr', 'nextweekroster'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = interaction.guild;
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

        const currentRosterDate = DateTime.fromJSDate(roster.roster_date);
        const now = DateTime.utc();
        const differenceInDays = currentRosterDate.diff(now, 'days').days;

        if(differenceInDays >= 7) {
            await send({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    'The next week roster is already settled',
                    embedColor,
                    '❌',
                    'Use /setroster command to setup a new roster in this channel\n You can also try using /rosterhelp for extra information',
                )
            ]});
            
            return;
        };
        
        const newRosterDate = currentRosterDate.plus({ weeks: 1 });
        const rosterRoles = await roster.roles;

        await roster.update({
            roster_note: null,
            roster_date: newRosterDate.toJSDate(),
        });

        await rosterRoles.map((role) => {
            role.update({
                assigned_user: null,
                role_note: null,
            });
        });

        await send({ embeds: [
            createMessageEmbed(
                'Next week roster settled',
                'The next week roster has been settled',
                embedColor,
                '✅',
                'Use /rosterhelp for extra information about commands',
            )
        ]});
    } catch (error) {
        console.error(error);
        send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to set the next week roster',
                embedColor,
                '❌'
            )
        ]});
    };
};

export default command;