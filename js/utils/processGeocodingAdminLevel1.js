function processGeocodingAdminLevel1(geocodingResults) {
    // Check common expected results in specified order
    const adminLevel1 = geocodingResults.state || geocodingResults.country || geocodingResults.region || null;
    return adminLevel1
}

export default processGeocodingAdminLevel1;