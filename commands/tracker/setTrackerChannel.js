import { ChannelType, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import { getCategoryValues } from "../../utils/general.js";
import { createSelectCategoryRow } from "../../rows/index.js";
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

    const guildCategory = ChannelType.GuildCategory
    const categoryValues = await getCategoryValues(guild, guildCategory);
    const rows = createSelectCategoryRow(categoryValues)
    
    const message = await send({ content: 'Please select the category where you would like the tracker to be created', components: [rows] });
    const selectedCategoryFilter = i => i.customId === 'selectcategory' && i.user.id === interaction.user.id;
    const ONE_MINUTE = 600000;

    const collector = interaction.channel.createMessageComponentCollector({ selectedCategoryFilter, time: ONE_MINUTE });

    collector.on('collect', async (selectInteraction) => {
        const selectedValue = selectInteraction.values;
        const category = await guild.channels.cache.get(selectedValue[0]);
        const bot = client.config.botId;
        const permaTrackerChannel = await createPermaTrackerChannel(guild, category, bot);
        
        await permaTrackerChannel.send({ embeds: [createTrackerEmbed(embedColor)] });
        await message.edit({ content: `Perma-tracker channel has been created in the <#${selectedValue}> category`, components: [] });
        collector.stop();
    })

    collector.on('end', (collected, reason) => {
        if(reason === 'time') {
            message.edit({ content: 'Time is up for selecting, try using /settrackerchannel command again.', components: [] });
        }
    })

};


async function createPermaTrackerChannel(guild, category, bot){
    const permaTrackerChannel = await guild.channels.create({
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

    return permaTrackerChannel;
}

export default command;