import User from "./user.js";
import Guild from "./guild.js";
import BirthdayChannel from "./birthdayChannel.js";
import UserGuild from "./userGuild.js";
import Boss from "./boss.js";
import TrackerChannel from "./trackerChannel.js";
import BossAlias from "./bossAlias.js";

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

TrackerChannel.hasMany(Boss, { foreignKey: 'guild_id' });
Boss.belongsTo(TrackerChannel, { foreignKey: 'guild_id' });

BossAlias.belongsTo(Boss, { foreignKey: 'boss_id', targetKey: 'id' });
Boss.hasMany(BossAlias, { foreignKey: 'boss_id', sourceKey: 'id' });

export { User, Guild, BirthdayChannel, UserGuild, Boss, TrackerChannel, BossAlias };