import { ChannelType, PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";
import { createTrackerEmbed } from "../../embeds/index.js";

const command = new SlashCommandBuilder()
    .setName('settrackerchannel')
    .setDescription('Sets the channel where the perma-tracker will be display')
    .setDefaultMemberPermissions(0)
command.aliases = ['configtracker, ctracker'];

command.slashRun = async function slashRun(client, interaction) {
    const guild = await interaction.guild;
    const send = interaction.followUp.bind(interaction);
    const embedColor = client.config.embedColor;
    const categoriesChannel = await guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory);

    const options = categoriesChannel.map(channel => {
        return { label: channel.name, value: channel.id }
    })

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectcategory')
                .setPlaceholder('Nothing selected')
                .addOptions(options.map(option => ({ label: option.label, value: option.value }))),
        );

    const message = await send({ content: 'Please the category where you would like the tracker to be created', components: [row] });
    
    const filter = i => i.customId === 'selectcategory' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 50000 });

    collector.on('collect', async (selectInteraction) => {
        const selectedValue = selectInteraction.values;
        const category = await guild.channels.cache.get(selectedValue[0]);
        const bot = '1184628941194018869'
        
        const permaTracker = await guild.channels.create({
            name: 'perma-tracker',
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: PermissionsBitField.Flags.SendMessages,
                },
                {
                    id: bot,
                    allow: PermissionsBitField.Flags.SendMessages,
                }
            ]
        });
        
        await permaTracker.send({ embeds: [createTrackerEmbed(embedColor)] });

        await message.edit({ content: `Perma-tracker channel has been created in the <#${selectedValue}> category`, components: [] });
        

        collector.stop();
    })

    collector.on('end', (collected, reason) => {
        if(reason === 'time') {
            message.edit({ content: 'Time is up', components: [] });
        }
    })

};

export default command;