import { Users, Guilds, Channels, UsersGuilds } from './models/index.js';

Users.sync({alter: true});
Guilds.sync({alter: true});
Channels.sync({alter: true});
UsersGuilds.sync({alter: true});
