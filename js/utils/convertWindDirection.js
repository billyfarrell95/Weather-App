function convertWindDirection(degrees) {
    const directions = {
        north: "N",
        northNortheast: "NNE",
        northeast: "NE",
        eastNortheast: "ENE",
        east: "E",
        eastSoutheast: "ESE",
        southeast: "SE",
        southSoutheast: "SSE",
        south: "S",
        southSouthwest: "SSW",
        southwest: "SW",
        westSouthwest: "WSW",
        west: "W",
        westNorthwest: "WNW",
        northwest: "NW",
        northNorthwest: "NNW",
    }

    const compass = [
        { dir: directions.north, min: 0, max: 11.25 },
        { dir: directions.northNortheast, min: 11.25, max: 33.75 },
        { dir: directions.northeast, min: 33.75, max: 56.25 },
        { dir: directions.eastNortheast, min: 56.25, max: 78.75 },
        { dir: directions.east, min: 78.75, max: 101.25 },
        { dir: directions.eastSoutheast, min: 101.25, max: 123.75 },
        { dir: directions.southeast, min: 123.75, max: 146.25 },
        { dir: directions.southSoutheast, min: 146.25, max: 168.75 },
        { dir: directions.south, min: 168.75, max: 191.25 },
        { dir: directions.southSouthwest, min: 191.25, max: 213.75 },
        { dir: directions.southwest, min: 213.75, max: 236.25 },
        { dir: directions.westSouthwest, min: 236.25, max: 258.75 },
        { dir: directions.west, min: 258.75, max: 281.25 },
        { dir: directions.westNorthwest, min: 281.25, max: 303.75 },
        { dir: directions.northwest, min: 303.75, max: 326.25 },
        { dir: directions.northNorthwest, min: 326.25, max: 348.75 },
        { dir: directions.north, min: 348.75, max: 360 }
    ];
    let direction;
    for (const item of compass) {
        if (degrees >= item.min && degrees <= item.max) {
            direction = item.dir;
            break;
        }
    }

    return direction;
}

export default convertWindDirection;