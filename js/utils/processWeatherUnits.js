function processWeatherUnits(unitType, data) {
    // Round the value
    const roundedvalue = Math.round(data);

    const units = {
        temperature: "°F",
        precipSum: "in",
        precipProb: "%",
        speed: "mph",
      };

      let unit;
      // Assign a value to "unit" based on the unit passed from render function
      if (unitType === "temp") {
        unit = units.temperature;
      } else if (unitType === "precipSum") {
        unit = units.precipSum;
      } else if (unitType === "precipProb") {
        unit = units.precipProb;
      } else if (unitType === "speed") {
        unit = units.speed;
      }
      else {
        console.log("Invalid unit passed to getWeatherUnits()")
      }

      return roundedvalue + unit;
}

export default processWeatherUnits;