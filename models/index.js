import User from "./user.js";
import Guild from "./guild.js";
import BirthdayChannel from "./birthdayChannel.js";
import UserGuild from "./userGuild.js";

User.belongsToMany(Guild, { through: {
    model: UserGuild,
    unique: false,
},
    foreignKey: 'user_id'
});
Guild.belongsToMany(User, { through: {
    model: UserGuild,
    unique: false,
},
    foreignKey: 'guild_id'
});

Guild.hasMany(BirthdayChannel, { foreignKey: 'guild_id' });
BirthdayChannel.belongsTo(Guild, { foreignKey: 'guild_id' });

export { User, Guild, BirthdayChannel, UserGuild };