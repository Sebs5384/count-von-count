import { User, Guild, BirthdayChannel, UserGuild } from './models/index.js';

User.sync({alter: true});
Guild.sync({alter: true});
BirthdayChannel.sync({alter: true});
UserGuild.sync({alter: true});
