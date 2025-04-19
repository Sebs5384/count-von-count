import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { Roster, RosterRole } from "../../models/index.js";

const command = new SlashCommandBuilder()
    .setName('deleteroster')
    .setDescription('Deletes the roster of this channel')
command.aliases = ['dr', 'deleteroster'];
command.defer = false;

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = interaction.guild;
    const embedColor = client.config.embedColor;

    await runCommand(client, send, guild, embedColor, interaction);
};

async function runCommand(client, send, guild, embedColor, interaction) {
    try {
        const roster = await Roster.findOne({
            where: {
                guild_id: guild.id,
                channel_id: interaction.channelId
            }
        });
        const user = await guild.members.fetch(interaction.user.id);
        const rosterOrganizer = await roster.organized_by === interaction.user.id;

        if(!user.permissions.has('Administrator') && !rosterOrganizer) {
            await interaction.reply({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    'You need to be an admin or the organizer of the roster to delete it',
                    embedColor,
                    '❌',
                )
            ]});

            return;
        };
        
        const modal = new ModalBuilder()
            .setCustomId('deleteroster')
            .setTitle('Roster Deletion')
        const rosterNameInput = new TextInputBuilder()
            .setCustomId('rosternameinput')
            .setLabel('This action is final — type roster name')
            .setStyle(TextInputStyle.Short)
    
        const rosterNameRowBuilder = new ActionRowBuilder().addComponents(rosterNameInput);
        
        modal.addComponents(rosterNameRowBuilder);
        await interaction.showModal(modal);
    } catch (error) {
        console.error(error);
        await interaction.reply({ embeds: [
            createMessageEmbed(
                'Command failed',
                'Something went wrong while trying to delete the roster of this channel',
                embedColor,
                '❌',
            )
        ]});
    };
};

command.modalSubmit = async function modalSubmit(client, interaction) {
    const submittedName = interaction.fields.getTextInputValue('rosternameinput');
    const embedColor = client.config.embedColor;

    await runSubmit(client, submittedName, embedColor, interaction);
};

async function runSubmit(client, submittedName, embedColor, interaction) {
    try {
        const roster = await Roster.findOne({
            where: {
                guild_id: interaction.guild.id,
                channel_id: interaction.channelId
            },
            include: {
                model: RosterRole, as: 'roles'
            }
        });

        if(!roster) {
            await interaction.reply({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    'There is no roster settled in this channel',
                    embedColor,
                    '❌',
                )
            ]});

            return;
        };

        if(submittedName.toLowerCase() !== roster.roster_name.toLowerCase()) {
            await interaction.reply({ embeds: [
                createMessageEmbed(
                    'Command failed',
                    'The submitted name does not match the roster name',
                    embedColor,
                    '❌',
                )
            ]});

            return;
        };

        await roster.destroy();
        await interaction.reply({ embeds: [
            createMessageEmbed(
                'Roster deleted',
                'The roster of this channel has been deleted',
                embedColor,
                '✅',
            )
        ]});
    } catch (error) {
        console.error(error);
    };
};

export default command;