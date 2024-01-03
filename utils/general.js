export function isValidDateFormat(date) {
  const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])-([0]?[1-9]|1[0-2])$/;

  return dateRegex.test(date);
}

export function convertDateFormat(date) {
  const [day, month] = date.split('-');
  const year = new Date().getFullYear();
  const dateObject = new Date(`${year}-${month}-${day}`);

  if (dateObject.toString() === 'Invalid Date') return null;

  const convertedDate = dateObject.toISOString().split('T')[0];

  return convertedDate;
}

export function displayFormatedDate(date) {
  const [day, month] = date.split('-');
  const MONTHS_OF_YEAR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jum', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const MONTH = Number(month) - 1;
  const parsedDay = Number(day).toString();

  const dayWithSuffix = () => {
    if (day >= 11 && day <= 13) return `${parsedDay}th`;

    switch (day % 10) {
      case 1: return `${parsedDay}st`;
      case 2: return `${parsedDay}nd`;
      case 3: return `${parsedDay}rd`;
      default: return `${parsedDay}th`;
    }
  };

  return `${dayWithSuffix()} of ${MONTHS_OF_YEAR[MONTH]}`;
}

export function getUsersTags(client, users) {
  return Promise.all(users.map(async (user) => client.users.fetch(user.user_id)));
}

export function getUsersBirthdayDate(users) {
  const usersBirthdayDate = users.map((user) => user.birthday_date);

  for (const date of usersBirthdayDate) {
    const parsedDate = JSON.stringify(date);
    const [day, month] = parsedDate.split('T')[0].split('-').reverse();
    const formattedDay = Number(day).toString();

    const birthDate = `${formattedDay}-${month}`;

    usersBirthdayDate[usersBirthdayDate.indexOf(date)] = birthDate;
  }

  return usersBirthdayDate;
}

export function calculateRemainingTime(users) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const FIRST_DAY_OF_YEAR = new Date(currentYear, 0, 1);
  const FIRST_DAY_OF_NEXT_YEAR = new Date(currentYear + 1, 0, 1);

  const millisecondsInYear = FIRST_DAY_OF_NEXT_YEAR - FIRST_DAY_OF_YEAR;
  const totalDaysInYear = Math.ceil(millisecondsInYear / MILLISECONDS_IN_DAY);

  totalDaysInYear % 2 === 0 ? daysInMonth[1] = 29 : null;

  const remainingTime = users.map((user) => {  
    const usersBirthdayDate = new Date(user.birthday_date);
    usersBirthdayDate.setFullYear(currentYear);

    const differenceInMilliseconds = usersBirthdayDate - today;
    const remainingDays = Math.ceil((differenceInMilliseconds / (MILLISECONDS_IN_DAY)));
    
    return getRemainingTime(remainingDays);
  }) 

  return remainingTime;
}

function getRemainingTime(days) {
  let remainingDays = days;
  let months = 0;

  for(let i = 0; i < daysInMonth.length; i++) {
    const daysInCurrentMonth = daysInMonth[i];

    if(remainingDays >= daysInCurrentMonth) {
      remainingDays -= daysInCurrentMonth;
      months++;
    } else {
      break;
    }
  }

  if(remainingDays === 1) {
    const currentHour = today.getHours();
    const remainingHours = 24 - currentHour;

    return remainingHours;
  }

  if(months === 0) {
    const currentHour = today.getHours();
    const remainingHours = 24 - currentHour;

    return { remainingDays: remainingDays - 1 , remainingHours };
  }

  return {months, remainingDays}
}