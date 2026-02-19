export async function getUserList(client, users) {
  const userList = await Promise.all(users.map(async (user) => await client.users.fetch(user.user_id)));

  return userList;
}

export async function getMember(guild, member) {
  const guildMember = await guild.members.fetch({ user: member, force: true });

  return guildMember;
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

export function formatToFullDate(date) {
  const [day, month] = date.split('-');
  const year = new Date().getFullYear();
  const parsedDate = new Date(`${year}-${month}-${day}`);

  const invalidDate = parsedDate.toString() === 'Invalid Date';

  if (invalidDate) return null;

  const fullDate = parsedDate.toISOString().split('T')[0];

  return fullDate;
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
      killed: boss.boss_killed_at,
      bossAliases: boss.BossAliases,
    };

    guildBosses.push(bossDetails);
  }

  return guildBosses;
};


export function formatRaceData(timers) {
  
  const guildTimer = [];
  for(const timer of timers) {
    const timerDetails = {
      nextRaceTime: timer.next_race_time,
      raceSettler: timer.race_settler_id,
      raceHours: timer.hours_till_race,
      raceMinutes: timer.minutes_till_race,
      lastSettledRace: timer.last_settled_race_time,
    };

    guildTimer.push(timerDetails);
  };

  return guildTimer;
};

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
    const timeElapsedSinceKilled = getTimeElapsed(currentServerTimeInMinutes, totalMinutesWhenKilled);

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

export function getRaceTimers(races, serverTime) {
  
  const raceTimers = races.map((race) => {
    const raceId = race.id;
    const nextRaceTime = race.nextRaceTime;
    const raceHours = race.raceHours;
    const raceMinutes = race.raceMinutes;
    const lastSettledRaceTime = race.lastSettledRace;
    const lastSettledRaceTimestamp = new Date(lastSettledRaceTime);
    const currentServerTimestamp = new Date(serverTime.dateTime);
    
    if(!lastSettledRaceTime) return;
    
    const currentServerTimeInMinutes = getTotalMinutesFromDate(currentServerTimestamp); 
    const totalMinutesWhenSettled = getTotalMinutesFromDate(lastSettledRaceTimestamp);
    const minutesTillRace = getMinutesTillRace(raceHours, raceMinutes, totalMinutesWhenSettled);
    const timeElapsedSinceSettled = getTimeElapsed(currentServerTimeInMinutes, totalMinutesWhenSettled);

    const raceRemainingTimeInMinutes = (minutesTillRace - totalMinutesWhenSettled) - timeElapsedSinceSettled;
    const isRaceTime = raceRemainingTimeInMinutes < 0 && raceRemainingTimeInMinutes > -59;
    const raceStarted = raceRemainingTimeInMinutes === 0;
    const raceEndTimeInMinutes = (minutesTillRace + 60);
    const raceEnded = raceEndTimeInMinutes < currentServerTimeInMinutes;
    const minutesTillLastSettledRaceVanish = (raceEndTimeInMinutes + 150);

    if(currentServerTimeInMinutes > minutesTillLastSettledRaceVanish) {
      return {
        raceToRemove: raceId
      };
    };
    
    const remainingHoursTillRaceStarts = isRaceTime ? Math.ceil(raceRemainingTimeInMinutes / 60) : raceEnded ? Math.floor((raceRemainingTimeInMinutes + 120) / 60) : Math.floor((raceRemainingTimeInMinutes) / 60);
    const remainingMinutesTillRaceStarts = isRaceTime ? (raceRemainingTimeInMinutes + 60) % 60 : raceRemainingTimeInMinutes % 60;

    const raceEndTime = formatToClockHour(raceEndTimeInMinutes);
    const { raceStatusString, raceTimeString } = getRaceRangeString(remainingHoursTillRaceStarts, remainingMinutesTillRaceStarts, isRaceTime, raceEnded, nextRaceTime, raceEndTime);

    return {
      name: raceStatusString,
      value: raceTimeString,
      inline: true,
      raceStarted,
    }
  });

  return raceTimers;
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

function getRaceRangeString(remainingHours, remainingMinutes, isRaceTime, raceEnded, nextRaceTime, raceEndTime) {
  let raceTimeString = "";
  let raceStatusString = "";

  if(remainingHours !== 0) raceTimeString += `${Math.abs(remainingHours)} ${remainingHours === 1 ? "hour" : "hours"} `;
  if(remainingMinutes !== 0) raceTimeString += `${Math.abs(remainingMinutes)} ${remainingMinutes === 1 ? "minute" : "minutes"}`;

  if(raceEnded) {
    raceTimeString = `\`The race has ended, ${raceTimeString} ago\``;
    raceStatusString = `Race has ended at: ${raceEndTime} Server Time`;
  } else if(isRaceTime) {
    raceTimeString = `\`The race have started, ${raceTimeString} till it ends\``;
    raceStatusString = `Race has started at: ${nextRaceTime} Server Time`;
  } else if(remainingHours === 0 && remainingMinutes === 0) {
    raceTimeString = `\`The race have just started now !\``;
    raceStatusString = `Race has started at: ${nextRaceTime} Server Time`;
  } else {
    raceTimeString = `\`The summer race will start in ${raceTimeString} from now\``;
    raceStatusString = `Race will start at: ${nextRaceTime} Server Time`;
  };

  return {
    raceStatusString,
    raceTimeString
  }
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
    Aliases: ${boss.bossAliases.length > 0 ? boss.bossAliases.map((bossAlias) => `\`${bossAlias.boss_alias}\``) : `\`None\``}
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

function getTimeElapsed(startTimeInMinutes, endTimeInMinutes) {
  if(startTimeInMinutes < endTimeInMinutes) {
    const ONE_DAY = 1440;
    const timeElapsed = (ONE_DAY + startTimeInMinutes) - endTimeInMinutes;

    return timeElapsed
  } else {
    const timeElapsed = startTimeInMinutes - endTimeInMinutes;

    return timeElapsed;
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

export function getHelpFields(commands) {
  return commands.map((command) => ({
    name: `***- ${command.name} -***`,
    value: `\`${command.description}\`\n***options***: ${
      command.options.length > 0 ? command.options.map((option) => `\`${option.name}\``).join(', ')
      : '`None`'
    }`,
    inline: false
  }));
};

export function getCommandOptionValues(command) {
  return `\n${command.length > 0 ? command.map(option => `\`${option.name}: ${option.description}\``).join('\n\n') : `\`This command have no options\``}`
};

export function getPaginationValues(currentPage, itemsPerPage, array) {
  const listLength = array.length;
  const totalPages = Math.ceil(listLength / itemsPerPage);
  let firstPage = currentPage * itemsPerPage;
  let lastPage = firstPage + itemsPerPage;
  let list = array.slice(firstPage, lastPage);

  return { list, listLength, firstPage, lastPage, totalPages };
};

export function getFilesName(files, extension) {
  const fileNames = files.map(file => {
      const fileNameWithoutExtension = file.replace(extension, '');
      const fileName = fileNameWithoutExtension.split(/(?=[A-Z])/g).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');

      return fileName;
  });

  return fileNames;
};

export function findMatchingFile(files, input) {
  const inputWords = input.toLowerCase().split(/\s+/);

  for(const file of files) {
      const formattedFileName = file.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace('.json', '');
      let matchFound = false;

      for(const word of inputWords) {
          if(formattedFileName.includes(word)) {
            matchFound = true;
            break;
          }
      };

      if(matchFound) {
        return file;
      };
  };

  return false;
};

export function findMatchingInitials(words, input) {
  for(const word of words) {
      const firstInitial = word[0];
      const uppercaseInitials = word.replace(/[^A-Z]/g, '');
      const userInput = input.toLowerCase();
      const intials = (firstInitial + uppercaseInitials).toLowerCase();
      
      if(intials === userInput) {
        return word;
      };
  };

  return false;
};

export function findMatchingName(names, input) {
  const inputWords = input.toLowerCase().split(/\s+/);

  for(const name of names) {
    const formattedName = name.toLowerCase();
    let matchFound = false;

    for(const word of inputWords) {
      if(formattedName.includes(word)) {
        matchFound = true;
        break;
      };
    };

    if(matchFound) {
      return name;
    };
  };

  return false;
};

export function getSuperQuestItemData(sqi) {
  return {
      name: sqi.name,
      description: sqi.description,
      stats: sqi.stats,
      itemClass: sqi.itemClass,
      attackStrength: sqi.attackStrength,
      weaponLevel: sqi.weaponLevel,
      defenseRate: sqi.defenseRate,
      weight: sqi.weight,
      requiredLevel: sqi.requiredLevel,
      applicationJobs: sqi.applicationJobs,
      ingredients: sqi.ingredients,
      bonuses: sqi.bonuses,
      image: sqi.image,
      icon: sqi.icon
  };
};

export function getSqiMainStatFields(sqi) {
  const mainStatFields = [
      { name: 'Description', value: sqi.description },
      { name: 'Stats', value: sqi.stats.map(stat => `- ${stat}`).join('\n') },
      { name: 'Item Class', value: sqi.itemClass },
      { name: 'Weight', value: sqi.weight },
      { name: 'Required Level', value: sqi.requiredLevel },
      { name: 'Application Jobs', value: sqi.applicationJobs.map(job => `- ${job}`).join('\n') },
  ];

  if(sqi.attackStrength) mainStatFields.splice(3, 0, { name: 'Attack Strength', value: sqi.attackStrength });
  if(sqi.defenseRate) mainStatFields.splice(3, 0, { name: 'Defense Rate', value: sqi.defenseRate });
  if(sqi.weaponLevel) mainStatFields.splice(5, 0, { name: 'Weapon Level', value: sqi.weaponLevel });

  return mainStatFields;
};

export function getSqiIngredientFields(sqi) {
  const ingredientFields = [
      { name: 'Crafting Ingredients', value: sqi.ingredients.map(ingredient => `- ${ingredient}`).join('\n') }
  ];

  return ingredientFields;
};

export function getSqiBonusFields(sqi) {
  const bonusFields = [];
  const maxFieldLength = 1024;
  const bonuses = sqi.bonuses;
  let currentField = { name: 'Bonuses', value: '' };
  
  if(!bonuses) return { name: 'Bonuses', value: 'None' };

  for(const bonus of bonuses) {
      const fieldLength = currentField.value.length + bonus.length;
      
      if(fieldLength > maxFieldLength) {
          bonusFields.push(currentField);
          currentField = { name: '\u00A0', value: ''};

          currentField.value += `- ${bonus}\n`
      } else {
          currentField.value += `- ${bonus}\n`;
      };
      

  };

  if(currentField.value.trim() !== '') {
      bonusFields.push(currentField);
  };

  return bonusFields;
};

export function getCurrentButtons(currentButton) {
  switch(currentButton) {
      case 'sqidescription': 
          return ['sqibonuses', 'sqiingredients'];
      case 'sqibonuses':
          return ['sqidescription', 'sqiingredients'];
      case 'sqiingredients':
          return ['sqidescription', 'sqibonuses'];
  };
};

export function getRaceTime(hours, minutes, serverTime) {
  const [currentHours, currentMinutes] = serverTime.time.split(':').map(Number);

  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const minutesTillNextRace = hours * 60 + minutes;
  const newTotalMinutes = currentTotalMinutes + minutesTillNextRace;
  
  const newHours = Math.floor(newTotalMinutes / 60) % 24;
  const newMinutes = newTotalMinutes % 60;

  const timePeriod = newHours >= 12 ? 'PM' : 'AM';
  const fomarttedHours = newHours.toString().padStart(2, '0');
  const formattedMinutes = newMinutes.toString().padStart(2, '0');
  const raceTime = `${fomarttedHours}:${formattedMinutes}`;

  return {
    raceTime,
    timePeriod
  }
};

export function getMinutesTillRace(raceHours, raceMinutes, totalMinutesWhenSettled) {
  const totalMinutes = raceHours * 60 + raceMinutes;
  const minutesTillRace = totalMinutes + totalMinutesWhenSettled;

  return minutesTillRace;
};

export function formatRosterDate(rosterDate, rosterTime, dateTime) {
  if(!rosterDate || !rosterTime) return;
  
  const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])$/;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if(!dateRegex.test(rosterDate) || !timeRegex.test(rosterTime)) return false;

  try {
      const year = new Date().getFullYear();
      const [month, day] = rosterDate.split('/').map(Number);
      const [hour, minute] = rosterTime.split(':').map(Number);

      const serverTime = dateTime.fromObject(
        { year, month, day, hour, minute },
        { zone: 'America/Los_Angeles' }
      );

      return new Date(serverTime.toUTC().toISO());
  } catch (error) {
      console.error(error);
      return false;
  };
};

  export function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    };
  };

export async function getRosterRoles(roles, type) {
  const rosterRoles = await roles
    .filter(role => role.dataValues.role_type === type)
    .map((role) => `\`${role.dataValues.role_position}\`: ${role.dataValues.role_name} - ${role.dataValues.assigned_user ? `<@${role.dataValues.assigned_user}> ${role.dataValues.role_note ? `- (${role.dataValues.role_note})` : ''}` : 'Free'}`)
    .join('\n');
  return rosterRoles;
};

export function chunkIntoColumns(array, columns = 2) {
  const perColumn = Math.ceil(array.length / columns);
  const result = [];

  for (let i = 0; i < columns; i++) {
    result.push(array.slice(i * perColumn, (i + 1) * perColumn));
  };

  return result;
};