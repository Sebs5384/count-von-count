export async function getUserList(client, users) {
  const userList = await Promise.all(users.map(async (user) => await client.users.fetch(user.user_id)));

  return userList;
}

export async function getMember(guild, member) {
  const guildMember = await guild.members.fetch({ user: member, force: true });

  return guildMember;
}

export function getUsersBirthdayDate(users) {
  const usersBirthdayDate = users.map((user) => user.birthday_date);

  return usersBirthdayDate;
}

export async function getBirthdayUser(users, client) {
  const birthdayUsers = [];

  for (const user of users) {
    const today = new Date().toISOString().split('T')[0]
    const userBirthdayDate = new Date(user.birthday_date).toISOString().split('T')[0]

    if (userBirthdayDate === today) {
      const birthdayUser = await client.users.fetch(user.user_id);

      birthdayUsers.push(birthdayUser)
    }
  }

  return birthdayUsers;
}

export function isValidDateFormat(date) {
  const dateRegex = /^(0?[1-9]|1[0-9]|2[0-9])-(0?[1-9]|1[0-2])$|(29|30)-(0?[13-9]|1[0-2])$|31-(0?[13578]|1[02])$|29-02-(0?[1-9]|1[0-2])$|30-04|30-06|30-09|30-11$/;

  return dateRegex.test(date);
}

export function isValidBossNameFormat(bossName) {
  const validBossRegex = /^[a-zA-Z0-9 ]+$/;

  return validBossRegex.test(bossName);
}

export function isValidMapNameFormat(mapName) {
  const validMapRegex = /^[a-zA-Z]+(_?[a-zA-Z]*)?(\d{1,2})?$/;

  return validMapRegex.test(mapName);
}

export function formatDate(dates) {
  const formattedDates = dates.map((date) => {
    const [day, month, year] = date.toISOString().split('T')[0].split('-');
    const formattedDay = Number(day).toString();

    const birthDate = `${formattedDay}-${month}-${year}`;

    dates[dates.indexOf(date)] = birthDate;
  })

  return formattedDates;
}

export function formatToFullDate(date) {
  const [day, month] = date.split('-');
  const year = new Date().getFullYear();
  const parsedDate = new Date(`${year}-${month}-${day}`);

  const invalidDate = parsedDate.toString() === 'Invalid Date';

  if (invalidDate) return null;

  const fullDate = parsedDate.toISOString().split('T')[0];

  return fullDate;
}

export function getDateWithSuffix(dateList, fullDate = false) {
  const dateListWithSuffix = dateList.map((date) => {
    const [day, month, year] = date.split('T')[0].split('-').reverse();
    const MONTHS_OF_YEAR = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
    const MONTH = Number(month) - 1;
    const dayWithSuffix = getDayWithSuffix(day);

    if (fullDate) {
      return `${dayWithSuffix} of ${MONTHS_OF_YEAR[MONTH]} ${year}`
    } else {
      return `${dayWithSuffix} of ${MONTHS_OF_YEAR[MONTH]}`;
    }

  })

  return dateListWithSuffix
}

function getDayWithSuffix(day) {
  const parsedDay = Number(day).toString();
  if (day >= 11 && day <= 13) return `${parsedDay}th`;

  switch (day % 10) {
    case 1: return `${parsedDay}st`;
    case 2: return `${parsedDay}nd`;
    case 3: return `${parsedDay}rd`;
    default: return `${parsedDay}th`;
  }
};

export async function calculateRemainingTime(users, today) {
  const currentYear = today.getFullYear();

  const remainingTime = users.map((user) => {
    const usersBirthdayDate = new Date(user.birthday_date).setFullYear(currentYear);
    const remainingTimeInMilliseconds = usersBirthdayDate - today;

    return remainingTimeInMilliseconds
  })

  return remainingTime
}

export function formatRemainingTime(remainingTimeInMilliseconds, today) {
  const currentYear = today.getFullYear();
  const currentHour = today.getHours();
  const FIRST_DAY_OF_YEAR = new Date(currentYear, 0, 1);
  const FIRST_DAY_OF_NEXT_YEAR = new Date(currentYear + 1, 0, 1);
  const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
  const HOURS_IN_DAY = 24;
  const millisecondsInYear = FIRST_DAY_OF_NEXT_YEAR - FIRST_DAY_OF_YEAR;

  const totalDaysInYear = Math.ceil(millisecondsInYear / MILLISECONDS_IN_DAY);
  const isLeapYear = totalDaysInYear % 2 === 0 ? 29 : 28;
  
  const daysInMonth = [31, isLeapYear, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


  const remainingTime = remainingTimeInMilliseconds.map((time) => {
    let remainingDays = Math.ceil(time / MILLISECONDS_IN_DAY);
    let months = 0;
    
    if (time < 0) {
      const DAYS_IN_YEAR = daysInMonth.reduce((acc, days) => acc + days, 0);
      const MILLISECONDS_IN_YEAR = 1000 * 60 * 60 * 24 * DAYS_IN_YEAR;
  
      remainingDays = Math.ceil((time + MILLISECONDS_IN_YEAR) / (MILLISECONDS_IN_DAY));
    }
  
    for (let i = 0; i < daysInMonth.length; i++) {
      const daysInCurrentMonth = daysInMonth[i];
  
      if (remainingDays >= daysInCurrentMonth) {
        remainingDays -= daysInCurrentMonth;
        months++;
      } else {
        break;
      }
    }
  
    if (months === 0 && remainingDays === 1) {
      const remainingHours = HOURS_IN_DAY - currentHour;
      remainingDays = remainingDays - 1;
  
      return { remainingDays, remainingHours };
    } else if (months === 0) {
      const remainingHours = HOURS_IN_DAY - currentHour;
      remainingDays = remainingDays - 1;
  
      return { remainingDays, remainingHours };
    } else {
      
      return { months, remainingDays };    
    }
  })

  return remainingTime;
}

export function getRemainingTimeMessage(timeTillNextBirthday) {
  const remainingTimeMessage = timeTillNextBirthday.map((time) => {

    if(time.months === 12) {
      return " 🍰🎉 Today 🎂🥳 ";
    } else if (time.months) {
      return ` In ${time.months > 1 ? `${time.months} Months` : `${time.months} Month`} ${time.remainingDays === 0 ? '' : `${time.remainingDays > 1 ? `${time.remainingDays} Days` : `${time.remainingDays} Day`} `}`;
    } else if (time.remainingDays) {
      return ` In ${time.remainingDays > 1 ? `${time.remainingDays} Days` : `${time.remainingDays} Day`} ${time.remainingHours === 0 ? '' : `${time.remainingHours} Hours `} `;
    } else if (time.remainingHours) {
      return ` In ${time.remainingHours > 1 ? `${time.remainingHours} Hours ` : `${time.remainingHours} Hour `}`;
    } 
  })

  return remainingTimeMessage
}

export function getBirthdayList(userList, birthdayDate, remainingTime) {

  const birthdayList = userList.map((user, index) => 
    `${index + 1}. ${user} - ${birthdayDate[index]} (${remainingTime[index]})`
  ).join('\n');

  return birthdayList;
};

export async function getCommandsByFolder(client, folderPath) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));

  const folderCommands = [];

  for(const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const { default: command } = await import(`../../${filePath}`);

    folderCommands.push(command);
  };

  return folderCommands;
};

export async function getCategoryValues(guild, typeOfChannel) {
  const categoriesChannel = await guild.channels.cache.filter(channel => channel.type === typeOfChannel);
  const categoryValues = categoriesChannel.map(channel => {
      return { label: channel.name, value: channel.id }
  })

  return categoryValues;
};

export function formatBossesData(bosses) {

  const guildBosses = [];
  for(const boss of bosses) {
    const bossDetails = {
      name: boss.boss_name,
      map: boss.boss_map,
      downtime: boss.boss_downtime,
      spawnWindow: boss.boss_spawn_window,
      emoji: boss.boss_emoji,
      killed: boss.boss_killed_at
    }

    guildBosses.push(bossDetails);
  }

  return guildBosses;
}

export function filterBossTimers(bossTimers) {
  bossTimers.filter(field => field)
};

export function getBossTimers(bosses, serverTime) {

  const bossTimers =  bosses.map((boss) => {
    const bossName = boss.name;
    const bossEmoji = boss.emoji;
    const bossDowntime = boss.downtime;
    const bossSpawnWindow = boss.spawnWindow;
    const bossKilledAt = boss.killed;
    const bossFullRange = bossDowntime + bossSpawnWindow;
    const bossKilledAtTimestamp = new Date(bossKilledAt);
    const currentServerTimestamp = new Date(serverTime.dateTime);

    if(!bossKilledAt) return;

    const currentServerTimeInMinutes = getTotalMinutesFromDate(currentServerTimestamp); 
    const totalMinutesWhenKilled = getTotalMinutesFromDate(bossKilledAtTimestamp);
    const minutesTillBossRange = getMinutesTillBossRange(bossDowntime, totalMinutesWhenKilled);
    const minutesTillBossFullRange = getMinutesTillBossFullRange(bossSpawnWindow, minutesTillBossRange);
    const nextRange = formatToClockHour(minutesTillBossRange);
    const timeElapsedSinceKilled = getTimeElapsedSinceKilled(currentServerTimeInMinutes, totalMinutesWhenKilled);

    const bossRemainingDowntime = (bossDowntime - timeElapsedSinceKilled);
    const bossRemainingTimeTillSpawn = (bossFullRange - timeElapsedSinceKilled);
    const minutesTillBossVanishFromTracker = -(bossFullRange / 2);

    if(bossRemainingTimeTillSpawn < minutesTillBossVanishFromTracker) {
      return {
        bossToRemove: bossName,
      }
    }

    const formattedRangeTiming = formatBossTimeMinutes(bossRemainingDowntime, bossRemainingTimeTillSpawn);
    const bossStatus = getBossStatus(bossRemainingDowntime, bossRemainingTimeTillSpawn);
    const bossTitleString = getBossTitleString(bossName, bossEmoji, bossStatus, nextRange)
    const bossRangeString = getBossRangeString(formattedRangeTiming);

    return {
      name: bossTitleString,
      value: bossRangeString,
      inline: true
    };
  });

  return bossTimers;
};

function formatBossTimeMinutes(bossRemainingDowntime, bossRemainingTimeTillSpawn) {
  const isPastDowntime = bossRemainingDowntime < 0;
  const isPastSpawn = bossRemainingTimeTillSpawn < 0;

  const remainingDowntimeInHours = isPastDowntime ? Math.ceil(bossRemainingDowntime / 60) : Math.floor(bossRemainingDowntime / 60);
  const remainingDowntimeInMinutes = bossRemainingDowntime % 60;

  const remainingTimeTillSpawnInHours = isPastSpawn ? Math.ceil(bossRemainingTimeTillSpawn / 60) : Math.floor(bossRemainingTimeTillSpawn / 60);
  const remainingTimeTillSpawnInMinutes = bossRemainingTimeTillSpawn % 60;

  const bossRemainingTime = {
    remainingDowntimeInHours,
    remainingDowntimeInMinutes,
    remainingTimeTillSpawnInHours,
    remainingTimeTillSpawnInMinutes
  };

  return bossRemainingTime;
};

function getBossTitleString(bossName, bossEmoji, bossStatus, nextRange) {
  return `${bossEmoji ? `${bossEmoji}` : ''} ${bossName} ${bossStatus ? `(${bossStatus})` : ''}  \nStart Time: ${nextRange}`;
}

function getBossRangeString(bossRange) {
  const downtimeHours = bossRange.remainingDowntimeInHours;
  const downtimeMinutes = bossRange.remainingDowntimeInMinutes;
  const spawnWindowHours = bossRange.remainingTimeTillSpawnInHours;
  const spawnWindowMinutes = bossRange.remainingTimeTillSpawnInMinutes;
  let downtimeRangeString = "";
  let spawnWindowRangeString = "";    
  

  if(downtimeHours !== 0) downtimeRangeString += `${Math.abs(downtimeHours)} ${downtimeHours === 1 ? "hour" : "hours"} `;
  if(downtimeMinutes !== 0) downtimeRangeString += `${Math.abs(downtimeMinutes)} ${downtimeMinutes === 1 ? "minute" : "minutes"}`;

  if(spawnWindowHours !== 0) spawnWindowRangeString += `${Math.abs(spawnWindowHours)} ${spawnWindowHours === 1 ? "hour" : "hours"} `;
  if(spawnWindowMinutes !== 0) spawnWindowRangeString += `${Math.abs(spawnWindowMinutes)} ${spawnWindowMinutes === 1 ? "minute" : "minutes"}`;

  if(downtimeHours < 0 || downtimeMinutes < 0) {
    downtimeRangeString = `Range: From ${downtimeRangeString} ago`
  } else if(downtimeHours === 0 && downtimeMinutes === 0) {
    downtimeRangeString = `Range: From Now`
  } else {
    downtimeRangeString = `Range: From ${downtimeRangeString}`
  }

  if(spawnWindowHours < 0 || spawnWindowMinutes < 0) {
    spawnWindowRangeString = `to ${spawnWindowRangeString} ago`
  } else if(spawnWindowHours === 0 && spawnWindowMinutes === 0) {
    spawnWindowRangeString = `to Now`
  } else {
    spawnWindowRangeString = `to ${spawnWindowRangeString}`
  }

  const bossRangeString = `${downtimeRangeString} ${spawnWindowRangeString}`;

  return bossRangeString;
};   

function getBossStatus(bossRemainingDowntime, bossRemainingTimeTillSpawn) {

  if(bossRemainingTimeTillSpawn < 0) {
    return 'Still not dead'
  } else if(bossRemainingDowntime < 0) {
    return 'In range';
  } else if (bossRemainingDowntime === 0 || bossRemainingTimeTillSpawn === 0) {
    return 'Now';
  } else {
    return '';
  };

};

export function getBossValuesField(boss) {
  const downtimeHours = Math.floor(boss.downtime / 60);
  const downtimeMinutes = boss.downtime % 60;
  const spawnWindowHours = Math.floor(boss.spawnWindow / 60);
  const spawnWindowMinutes = boss.spawnWindow % 60;
  
  const downtimeHourString = `${downtimeHours !== 0 ? `${downtimeHours !== 1 ? `${downtimeHours} hours` : `${downtimeHours} hour`}` : ''}`
  const downtimeMinutesString = `${downtimeMinutes !== 0 ? `${downtimeMinutes !== 1 ? `${downtimeMinutes} minutes` : `${downtimeMinutes} minute`}` : ''}`
  const spawnWindowHourString = `${spawnWindowHours !== 0 ? `${spawnWindowHours !== 1 ? `${spawnWindowHours} hours` : `${spawnWindowHours} hour`}` : ''}`
  const spawnWindowMinutesString = `${spawnWindowMinutes !== 0 ? `${spawnWindowMinutes !== 1 ? `${spawnWindowMinutes} minutes` : `${spawnWindowMinutes} minute`}` : ''}`

  return {
    name: `Name: ${boss.name}  ${boss.emoji ? boss.emoji : ''}`,
    value: `Map of Spawn: ${boss.map}
    Downtime: ${downtimeHourString} ${downtimeMinutesString} / Spawn Window: ${spawnWindowHourString} ${spawnWindowMinutesString}
    Aliases: '' 
    `
  }
}

export function getTotalMinutesFromDate(timestamp) {
  const hour = timestamp.getHours();
  const minutes = timestamp.getMinutes();

  const totalMinutes = hour * 60 + minutes;
  return totalMinutes;
};

function getMinutesTillBossRange(bossDowntime, totalMinutesWhenKilled) {
  const minutesTillBossRange = bossDowntime + totalMinutesWhenKilled;

  return minutesTillBossRange;
};

function getMinutesTillBossFullRange(bossSpawnwindow, minutesTillBossRange) {
  const minutesTillBossFullRange = bossSpawnwindow + minutesTillBossRange;

  return minutesTillBossFullRange;
};

function getTimeElapsedSinceKilled(currentServerTimeInMinutes, totalMinutesWhenKilled) {
  if(currentServerTimeInMinutes < totalMinutesWhenKilled) {
    const ONE_DAY = 1440;
    const timeElapsedSinceKilled = (ONE_DAY + currentServerTimeInMinutes) - totalMinutesWhenKilled;

    return timeElapsedSinceKilled;
  } else {
    const timeElapsedSinceKilled = currentServerTimeInMinutes - totalMinutesWhenKilled;

    return timeElapsedSinceKilled;
  };
};

function formatToClockHour(minutes) {
  const totalHours = Math.floor(minutes / 60);
  const formattedHours = totalHours % 24;
  const totalMinutes = Math.floor(minutes % 60);
  
  switch (totalMinutes) {
    case 0: return `${String(formattedHours).padStart(2, '0')}:00`
    default: return `${String(formattedHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}`
  };
};

export function getMvpHelpFieldValue(commandsFromTracker) {

  return `${commandsFromTracker.map((command) => {
    return `\`${command.name}\`: \`${command.description}\`
      \`Options:\` ${command.options.length > 0 ? command.options.map(option => `\`${option.name}\``).join(', ') : `\`None\``}
    `; 
  }).join('\n')}`;
  
};

export function getCommandOptionValues(command) {
  return `\n${command.length > 0 ? command.map(option => `\`${option.name}: ${option.description}\``).join('\n\n') : `\`This command have no options\``}`
};