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
        return roundedvalue + unit;
      } else if (unitType === "precipSum") {
        unit = units.precipSum;
        return roundedvalue + ` ${unit}`;
      } else if (unitType === "precipProb") {
        unit = units.precipProb;
        return roundedvalue + unit;
      } else if (unitType === "speed") {
        unit = units.speed;
        return roundedvalue + ` ${unit}`;
      } else if (unitType === "uv") {
        return roundedvalue;
      }
      else {
        console.log("Invalid unit passed to getWeatherUnits()")
      }
}

export default processWeatherUnits;