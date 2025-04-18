import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('clearroster')
    .setDescription('Clears the roster of this channel')
command.aliases = ['cr', 'clear']

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
            
            return;
        };
        const rosterRoles = await roster?.roles;
        
        await roster.update({
            roster_note: null,
            roster_date: null,
        });
    
        await rosterRoles.map((role) => role.update({
            assigned_user: null,
            role_note: null,
        }));

        await send({ embeds: [
            createMessageEmbed(
                'Roster cleared',
                'The roster has been cleared',
                embedColor,
                '✅',
            )
        ]});
    } catch (error) {
        console.error(error);
        await send({ embeds: [
            createMessageEmbed(
                'Command failed',
                'There was an unexpected error while trying to clear the roster',
                embedColor,
                '❌',
            )
        ]});
    };
};

export default command;