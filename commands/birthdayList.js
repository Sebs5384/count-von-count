import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
        
    console.log(birthdayDateList)
    console.log(usersList)
    send({ embeds: [listEmbed] });
}

function createBirthdayListEmbed(users, birthdayDate) {


    return new EmbedBuilder()
        .setTitle('Birthday List')
        .setThumbnail('https://i.ibb.co/8JtH5bN/birthday.png')
        .setDescription(`Here is the list of users with their birthday`)
        .setColor('#ED4245')
}

function getUsersTags(users, client) {
    return Promise.all(users.map(async (user) => await client.users.fetch(user.user_id)));
}

function getUsersBirthdayDate(users) {
    const usersBirthdayDate = users.map((user) => user.birthday_date);

    for (const date of usersBirthdayDate) {
        const date2 = JSON.stringify(date);
        const birthDate = date2.split('T')[0].split('-').reverse().slice(0, 2).join('-');
        console.log(birthDate);
    }
}

export default command