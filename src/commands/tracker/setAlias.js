import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { BossAlias, TrackerChannel, Boss } from "../../models/index.js";
import { isValidBossNameFormat } from "../../utils/general.js";
import { operator } from "../../../database.js";

const command = new SlashCommandBuilder()
    .setName('setalias')
    .setDescription('Set an alias for an existing boss')
    .addStringOption((option) => option
        .setName('mvp-name')
        .setDescription('Input the name of the boss you want to set an alias for e.g Wounded Morroc, required field')
        .setMaxLength(30)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName('mvp-alias')
        .setDescription('Input the alias you want to set e.g WM, required field')
        .setMaxLength(30)
        .setRequired(true)
    )
command.aliases = ['setalias, sa, alias, mvpalias, bossalias'];

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const guild = await interaction.guild;
    const embedColor = client.config.embedColor;

    const bossName = interaction.options.getString('mvp-name');
    const bossAlias = interaction.options.getString('mvp-alias');

    await runCommand(send, guild, embedColor, bossName, bossAlias);
};


async function runCommand(send, guild, embedColor, bossName, bossAlias) {
    const isValidBossName = isValidBossNameFormat(bossName);
    const isValidBossAlias = isValidBossNameFormat(bossAlias);
    const trackerChannel = await TrackerChannel.findOne({
        where: {
            guild_id: guild.id
        },
    });
    
    if(trackerChannel) {
        if(isValidBossName && isValidBossAlias) {
            try {
                const existingAlias = await BossAlias.findOne({
                    where: {
                        guild_id: guild.id,
                        boss_alias: {
                            [operator.like]: bossAlias
                        }
                    },    
                    collate: 'NOCASE'
                });

                if(existingAlias) {
                    const bossAliasTitle = `The alias already exists`;
                    const bossAliasMessage = `Something`
                    const bossAliasFooter = 'Check /mvphelp for more information';

                    await send({ embeds: [createMessageEmbed(bossAliasTitle, bossAliasMessage, embedColor, '❌', bossAliasFooter)] });
                } else {
                    const existingBoss = await Boss.findOne({
                        where: {
                            guild_id: guild.id,
                            boss_name: {
                                [operator.like]: bossName
                            }
                        },
                        collate: 'NOCASE'
                    });

                    if(existingBoss) {
                        const newAlias = await BossAlias.findOrCreate({
                            where: {
                                guild_id: guild.id,
                                boss_alias: {
                                    [operator.like]: bossAlias
                                }
                            },
                            defaults: {
                                guild_id: guild.id,
                                boss_id: existingBoss.id,
                                boss_alias: bossAlias
                            },
                            collate: 'NOCASE'
                        });

                        const bossAliasTitle = 'Alias added successfully';
                        const bossAliasMessage = `${bossName} has been aliased as ${bossAlias}`;
                        const bossAliasFooter = 'Check /mvphelp for more information';

                        await send({ embeds: [createMessageEmbed(bossAliasTitle, bossAliasMessage, embedColor, '✅', bossAliasFooter)] });
                    };
                };
            } catch (error) {
                console.error(`Error while setting the alias ${error}`);

                const errorTitle = 'Error while adding alias';
                const errorMessage = `There was an error while adding alias for ${bossName}, please try again`;
                const errorFooter = 'Check /mvphelp for more information';

                await send({ embeds: [createMessageEmbed(errorTitle, errorMessage, embedColor, '❌', errorFooter)] });
            };
        } else {
            const invalidValuesTitle = `Invalid values provided`
            const invalidValuesMessage = `Invalid boss name and alias \n Reading: ${bossName} and ${bossAlias}`;
            const invalidBossNameMessage = `Invalid boss name \n Reading: ${bossName}`;
            const invalidAliasMessage = `Invalid map name \n Reading: ${bossAlias}`;
            const invalidMessageFooterMessage = `Mvp name and alias should be alphanumeric only`;

            !isValidBossName && !isValidBossAlias
                ? send({ embeds: [createMessageEmbed(invalidValuesTitle, invalidValuesMessage, embedColor, '❌', invalidMessageFooterMessage)] })
                : !isValidBossName
                ? send({ embeds: [createMessageEmbed(invalidValuesTitle, invalidBossNameMessage, embedColor, '❌', invalidMessageFooterMessage)] })
                : !isValidMapName
                ? send({ embeds: [createMessageEmbed(invalidValuesTitle, invalidAliasMessage, embedColor, '❌', invalidMessageFooterMessage)] })
            : null;
        };

    } else {
        const noTrackerChannelTitle = 'No tracker channel found';
        const noTrackerMessage = 'Please configure the tracker channel first';
        const noTrackerFooter = 'Use /settrackerchannel to create your own tracker channel';

        await send({ embeds: [createMessageEmbed(noTrackerChannelTitle, noTrackerMessage, embedColor, '❌', noTrackerFooter)] });
    };

};

export default command;