import Users from './models/users.js'
import Guilds from './models/guilds.js'
import Channels from './models/channels.js'

Users.sync({alter: true});
Guilds.sync({alter: true});
Channels.sync({alter: true});