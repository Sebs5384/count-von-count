export function isValidDateFormat(date) {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\-([0]?[1-9]|1[0-2])$/;
  
    return dateRegex.test(date);
}
  
export function convertDateFormat(date){
    const [day, month] = date.split('-');
    const year = new Date().getFullYear();
    
    const dateObject = new Date(`${year}-${month}-${day}`);
    const convertedDate = dateObject.toISOString().split('T')[0];
  
    return convertedDate;
}
  
export function displayFormatedDate(date){
    const [day, month] = date.split('-')
    const MONTHS_OF_YEAR = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayWithSuffix =  () => {
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;	
        default: return `${day}th`;
      }
    }
  
    for (const monthIndex in MONTHS_OF_YEAR) {
      const monthIndexNumber = Number(monthIndex) + 1;
      if (monthIndexNumber == month) {
  
        return `${dayWithSuffix()} of ${MONTHS_OF_YEAR[monthIndex]}`;
      };
    };
  
};