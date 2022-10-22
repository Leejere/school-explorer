// Schoolmap-related funcs

// Function 2: make individual school features

// First, we need to get an array of all "grade" properties

function makeSchoolFeature(school) {
    return {
        "type": "Feature",
        "id": school["sdp_id"],
        "properties": {
            "school_name": school["name"],
            "school_level": school["School Level"],
            "management_organization": school["Management Organization"],
            "address": school["Street Address"],
        },
        "geometry": school["geom"],
    };
}

function getLevelColors(level) {
    return level === "High" ? "#353795":
           level === "Middle" ? "#353795":
           level === "Elementary-Middle" ? "#353795":
           level === "Elementary" ? "#353795":
           level === "Middle-High" ? "#353795":
           level === "Transition/Overage School" ? "#353795":
           level === "Elementary-Middle-High" ? "#353795":
                     "#353795";
}

function schoolMarkerStyle(feature) {
    return {
        radius: 5,
        color: getLevelColors(feature.properties.school_level),
        fillOpacity: 0.5,
        stroke: true,
        weight: 0.7,
    };
}

// Function 3: show school features on the base map
function showSchoolsOnMap(schoolsToShow, baseMap) {

    // First, make the individual school features into a feature collection
    const schoolFeatureCollection = {
        "type": "FeatureCollection",
        "features": schoolsToShow.map(makeSchoolFeature),
    };
    // Then, add features onto the map

    // But first: everytime this function is called, it means the user has made a different selection and the stops to show have changed
    // This means we have to first remove what's already showing

    if(baseMap.schoolLayers !== undefined){
        // removeLayer is a function that can be applied to a leaflet map
        baseMap.removeLayer(baseMap.schoolLayers);
    }

    // Because we want to constantly change what is being inputted into this function,
    // we want to make the school feature layers as a property of the school map
    // so that they can be altered and removed according to our need
    baseMap.schoolLayers = L.geoJSON(schoolFeatureCollection, {
        // This is an option within L.geoJSON. See doc here: https://leafletjs.com/reference.html#geojson
        // poinToLayer means you can make the points
        // into a layer of other features based on point latlng
        // in this case, use L.circleMarker
        pointToLayer: (geoJsonPoint, latlng) => L.circleMarker(latlng),
        // Style is also an option to be called inside geoJSON.
        style: schoolMarkerStyle,
    })
    .bindPopup(schoolPoint => schoolPoint.feature.properties['school_name'])
    .openPopup().addTo(baseMap);
}

export{
    makeSchoolFeature,
    showSchoolsOnMap,
};

window.showSchoolsOnMap = showSchoolsOnMap;
window.makeSchoolFeature = makeSchoolFeature;