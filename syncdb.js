import { User, Guild, UserGuild, Boss, TrackerChannel, BossAlias, Race, RosterRole } from './src/models/index.js';
import { sequelize } from "./database.js";

User.sync({alter: true});
Guild.sync({alter: true});
UserGuild.sync({alter: true});
Boss.sync({alter: true});
TrackerChannel.sync({alter: true});
BossAlias.sync({alter: true});
Roster.sync({alter: true});
RosterRole.sync({alter: true});
