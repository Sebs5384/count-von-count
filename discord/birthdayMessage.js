import { Events } from "discord.js";
import { getBirthdayUser } from "../utils/general.js";
import  Users  from "../models/users.js";

export const event = Events.ClientReady;

export const callback = async (client, message) => {
    const users = (await Users.findAll()).map(user => user.dataValues);
    
    (async () => {
        try {
            const { birthdayUser, userBirthdayDate, userGuildId } = await getBirthdayUser(users, client);
            
        } catch (error) {
            console.log(`Error sending birthday message: ${error}`);
        }
    })();
}