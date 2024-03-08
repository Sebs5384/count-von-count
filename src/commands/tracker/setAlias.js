import { SlashCommandBuilder } from "discord.js";
import { createMessageEmbed } from "../../embeds/index.js";
import { BossAlias, TrackerChannel, Boss } from "../../models/index.js";
import { isValidBossNameFormat } from "../../utils/general.js";

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
                                boss_id: existingBoss.boss_id,
                                boss_alias: bossAlias
                            },
                            collate: 'NOCASE'
                        });


                    } else {

                    };
                };


            } catch (error) {
                
            };
        } else {

        }
    } else {

    };

};