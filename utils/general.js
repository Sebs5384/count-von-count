export function isValidDateFormat(date) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-([0]?[1-9]|1[0-2])$/;

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

  const dayWithSuffix = () => {
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  return `${dayWithSuffix()} of ${MONTHS_OF_YEAR[MONTH]}`;
}

export function getUsersTags(users, client) {
  return Promise.all(users.map(async (user) => client.users.fetch(user.user_id)));
}

export function getUsersBirthdayDate(users) {
  const usersBirthdayDate = users.map((user) => user.birthday_date);

  for (const date of usersBirthdayDate) {
    const parsedDate = JSON.stringify(date);
    const birthDate = parsedDate.split('T')[0].split('-').reverse().slice(0, 2).join('-');

    usersBirthdayDate[usersBirthdayDate.indexOf(date)] = birthDate;
  }

  return usersBirthdayDate;
}
