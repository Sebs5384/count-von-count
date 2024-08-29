import { User, Guild, BirthdayChannel, UserGuild, Boss, TrackerChannel, BossAlias, Race, RaceChannel } from './src/models/index.js';

User.sync({alter: true});
Guild.sync({alter: true});
BirthdayChannel.sync({alter: true});
UserGuild.sync({alter: true});
Boss.sync({alter: true});
TrackerChannel.sync({alter: true});
BossAlias.sync({alter: true});
Race.sync({alter: true});
RaceChannel.sync({ alter: true });