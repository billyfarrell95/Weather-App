function createForecastDisplayDates() {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
    const newDate = new Date();
    const dates = [];
  
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = weekdays[newDate.getDay()];
      const month = newDate.toLocaleString('default', { month: 'long' });
      const date = newDate.getDate();
      const formattedDate = `${dayOfWeek}, ${month} ${date}`;
      dates.push(formattedDate);
      
      // Increment the date for the next day
      newDate.setDate(newDate.getDate() + 1);
    }
  
    return dates;
}

export default createForecastDisplayDates;