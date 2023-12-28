import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUsersTags, getUsersBirthdayDate } from '../utils/general.js';
import Users from '../models/users.js';

const command = new SlashCommandBuilder()
    .setName('birthdaylist')
    .setDescription('Displays the list of users with their birthday')

command.aliases = ['bl', 'bdaylist', 'blist']

command.slashRun = async function slashRun(client, interaction) {
    const send = interaction.followUp.bind(interaction);
    const users = await Users.findAll();


    const usersList = await getUsersTags(users, client);
    const birthdayDateList = await getUsersBirthdayDate(users);
    const listEmbed = createBirthdayListEmbed(usersList, birthdayDateList);
        
    send({ embeds: [listEmbed] });
}

function createBirthdayListEmbed(users, birthdayDate) {


    return new EmbedBuilder()
        .setTitle('Birthday List')
        .setThumbnail('https://i.ibb.co/8JtH5bN/birthday.png')
        .setDescription(`Here is the list of users with their birthday`)
        .setColor('#ED4245')
}

export default command