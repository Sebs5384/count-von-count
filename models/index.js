import User from "./user.js";
import Guild from "./guild.js";
import Channel from "./channel.js";
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

export { User, Guild, Channel, UserGuild };