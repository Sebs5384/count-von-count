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
}

export function getCommandByType(commands) {
  const commandTypes = {};

  commands.forEach((command) => {
      const typeKeys = Object.keys(commandTypes);
      const commandType = typeKeys.find(type => command.name.includes(type));

      if(commandType) {
          commandTypes[commandType].push(command);
      } else {
          commandTypes[command.name] = [command];
      }
  });

  return commandTypes;
}

export function getCommands(commands) {
  const commandName = {};
  for(const type in commands) {
      const commandType = commands[type];

      for(const command of commandType) {
        commandName[command.name] = command;
      }
  }

  return commandName;
}

export async function getCategoryValues(guild, typeOfChannel) {
  const categoriesChannel = await guild.channels.cache.filter(channel => channel.type === typeOfChannel);
  const categoryValues = categoriesChannel.map(channel => {
      return { label: channel.name, value: channel.id }
  })

  return categoryValues;
};


export function getBossTimers(bosses, serverTime) {

  const mvpTimers =  bosses.map((boss) => {

    const bossDownTime = boss.downtime;
    const bossSpawnWindow = boss.spawnWindow;
    const bossKilledAt = boss.killed;
    const currentServerTimeInClockFormat = serverTime.time;

    if(!bossKilledAt) {
      return;
    }

    const totalMinutesWhenKilled = getTotalMinutesFromClockFormat(bossKilledAt);
    const currentServerTimeInMinutes = getTotalMinutesFromClockFormat(currentServerTimeInClockFormat);
    const totalMinutesTillRange = getMinutesTillRange(bossDownTime, totalMinutesWhenKilled);
    const nextRange = formatToClockHour(totalMinutesTillRange);
    const mvpTimer = (currentServerTimeInMinutes - totalMinutesWhenKilled) + totalMinutesWhenKilled;
    const maxMinutesUntilMvpVanishFromTracker = (totalMinutesWhenKilled + (bossDownTime + bossSpawnWindow * 2))

    if(currentServerTimeInMinutes >= maxMinutesUntilMvpVanishFromTracker) {
      return;
    }
  
    const bossRange = getBossRange(mvpTimer, totalMinutesTillRange, bossSpawnWindow);
    const bossStatus = getBossStatus(currentServerTimeInMinutes, totalMinutesTillRange, bossSpawnWindow);
    const bossField = getBossField(boss, bossRange);

    return {
      name: `${boss.emoji ? `${boss.emoji} ` : ''} ${boss.name} ${bossStatus ? `(${bossStatus})` : ''} \nStart Time: ${nextRange}`,
      value: `${bossField}`,
      inline: true
    };
  });
  
  const filteredMvpTimers = mvpTimers.filter(field => field)

  return filteredMvpTimers;
};

export function getGuildBosses(bosses) {

  const guildBosses = [];
  for(const boss of bosses) {
      const mvp = {
          name: boss.boss_name,
          map: boss.boss_map,
          downtime: boss.boss_downtime,
          spawnWindow: boss.boss_spawn_window,
          emoji: boss.boss_emoji,
          killed: boss.boss_killed_at
      }

      guildBosses.push(mvp);
  }

  return guildBosses;
}

function getBossField(boss, bossRange) {
    
  let downTimeHours = bossRange.remainingDownTimeInHours;
  let downTimeMinutes = bossRange.remainingDownTimeInMinutes;
  let spawnWindowHours = bossRange.remainingTimeTillSpawnInHours;
  let spawnWindowMinutes = bossRange.remainingTimeTillSpawnInMinutes;

  const formatTime = (hours, minutes) => {
    let timeString = "";    
    
    if(hours < 0) { 
      timeString += ''
    } else if(hours !== 0) {
      timeString += `${Math.abs(hours)} ${hours === 1 ? "hour" : "hours"} `;
    } 

    if(minutes !== 0) {
      timeString += `${Math.abs(minutes)} ${minutes === 1 ? "minute" : "minutes"}`;
    }

    return timeString;
  }

  let formattedDownTime = formatTime(downTimeHours, downTimeMinutes);
  let formattedSpawnWindow = formatTime(spawnWindowHours, spawnWindowMinutes);

  if(downTimeHours < 0 ) {
    formattedDownTime = `Range: From ${formattedDownTime} ago`
  } else if(downTimeHours === 0 && downTimeMinutes === 0) {
    formattedDownTime = `Range: From now`
  } else {
    formattedDownTime = `Range: From ${formattedDownTime}`
  }

  if(spawnWindowHours < 0 ) {
    formattedSpawnWindow = `to ${formattedSpawnWindow} ago`
  } else if(spawnWindowHours === 0 && spawnWindowMinutes === 0) {
    formattedSpawnWindow = `to now`
  } else {
    formattedSpawnWindow = `to ${formattedSpawnWindow}`
  }

  const bossFieldMessage = `${formattedDownTime} ${formattedSpawnWindow}`;

  return bossFieldMessage;
};   

function getBossStatus(currentServerTimeInMinutes, minutesTillRange, bossSpawnWindow) {
  const totalBossRange = minutesTillRange + bossSpawnWindow;
  
  if(currentServerTimeInMinutes >= totalBossRange) {
    return 'Still not dead';
  } else if (currentServerTimeInMinutes >= minutesTillRange) {
    return 'In range';
  } else {
    return '';
  }
};

function getTotalMinutesFromClockFormat(timeInClockFormat) {
  const [hours, minutes] = timeInClockFormat.split(':').map((time) => Number(time));
  const totalMinutesWhenKilled = hours * 60 + minutes;

  return totalMinutesWhenKilled;
};

function getMinutesTillRange(bossDownTime, totalMinutesWhenKilled) {
  const totalMinutesTillRange = totalMinutesWhenKilled + bossDownTime;
  
  return totalMinutesTillRange;
};

function getBossRange(totalMinutesWhenKilled, totalMinutesTillRange, bossSpawnWindow) {
  const bossRemainingDownTime = totalMinutesTillRange - totalMinutesWhenKilled;
  const bossRemainingTimeTillSpawn = (bossSpawnWindow + totalMinutesTillRange) - totalMinutesWhenKilled;

  const remainingDownTimeInHours = Math.floor(bossRemainingDownTime / 60);
  const remainingDownTimeInMinutes = bossRemainingDownTime % 60;

  const remainingTimeTillSpawnInHours = Math.floor(bossRemainingTimeTillSpawn / 60);
  const remainingTimeTillSpawnInMinutes = bossRemainingTimeTillSpawn % 60;

  const bossRange = {
    remainingDownTimeInHours,
    remainingDownTimeInMinutes,
    remainingTimeTillSpawnInHours,
    remainingTimeTillSpawnInMinutes
  };

  return bossRange;
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