import User from "./user.js";
import Guild from "./guild.js";
import UserGuild from "./userGuild.js";
import Boss from "./boss.js";
import TrackerChannel from "./trackerChannel.js";
import BossAlias from "./bossAlias.js";
import Race from "./race.js";
import RaceChannel from "./raceChannel.js";
import Roster from "./roster.js";
import RosterRole from "./rosterRole.js";

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

TrackerChannel.hasMany(Boss, { foreignKey: 'guild_id' });
Boss.belongsTo(TrackerChannel, { foreignKey: 'guild_id' });

BossAlias.belongsTo(Boss, { foreignKey: 'boss_id', targetKey: 'id' });
Boss.hasMany(BossAlias, { foreignKey: 'boss_id', sourceKey: 'id' });

RaceChannel.hasMany(Race, { foreignKey: 'guild_id' });
Race.belongsTo(RaceChannel, { foreignKey: 'guild_id' });

Roster.hasMany(RosterRole, { foreignKey: 'roster_id', as: 'roles' });
RosterRole.belongsTo(Roster, { foreignKey: 'roster_id', as: 'roster' });

export { 
    User, 
    Guild, 
    UserGuild, 
    Boss, 
    TrackerChannel, 
    BossAlias, 
    Race, 
    RaceChannel,
    Roster,
    RosterRole
};