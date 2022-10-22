import { schoolsShownOnMap } from "./main.js";
import { baseMap } from "./main.js";
import { showSchoolsOnMap } from "./school-map.js";
import { makeSchoolFeature } from "./school-map.js";
import catchments from "../data/catchments.js";
import cityLimit from "../data/City_Limits.js";
import { htmlToElement } from "./template-tools.js";
import { gradeArr } from './main.js';
import { saveStateToUrl } from './url-hash.js';

//-----------------------------------------------//
// A SET OF FUNCTIONS
// ALL THESE FUNCTIONS ARE SUPPOSED TO BE USED
// ON CLICK
//-----------------------------------------------//

//-----------------------------------------------//
// FUNCTION TO GET ALL SCHOOLS CURRENTLY HIGHLIGHTED
//-----------------------------------------------//

// Make school name highlighted on click, and cancel the highlight on the next click
// Highlight means: changing the CSS class to another class using JS


let schoolListItemClassNames = ['school-list-item', 'school-list-item-clicked'];

// Everytime a new click is happening, we will recalculate which schools are highlighted
// A function to generate a list of school that's currently highlighted

function getSchoolsToCompare() {
  let schoolsShownInList = document.querySelectorAll(".school-list-item, .school-list-item-clicked");
  let schoolsToCompare = [];

  // In schoolsShownInList, find those with value=0
  for(let schoolShown of schoolsShownInList) {
    if(schoolShown.value == 1) {
      schoolsToCompare.push(schoolShown.title);
    }
  }

  return schoolsToCompare;
}

//-----------------------------------------------//
// SHOW SCHOOLS TO COMPARE IN RIGHT COLUMN
//-----------------------------------------------//

const schoolsCompareContainer = document.querySelector("#school-compare-container");

function showSchoolsCompare(schoolsToCompare) {
  schoolsCompareContainer.innerHTML = "";

  // Get all the schools
  const schoolsToHighlight = schoolsShownOnMap.filter(school =>
    schoolsToCompare.includes(school["name"]));

  for(let school of schoolsToHighlight) {

    // Get what grades this schools serves
    let thisGradeArr = [];
    for(let grade of gradeArr) {
        if(school[grade] === "1") {
            thisGradeArr.push(grade.substring(6));
        }
    }
    // Create content for schools for comparison
    const html = `
      <div class="school-compare-item">
        <div class="school-name">${school["name"]}</div>
        <div class="content">
          <div class="item-title">${school["Admission Type"]}</div>
          <div class="item-title">Grade ${thisGradeArr.join(", ")}</div>
          <div class="item-title">${school["Learning Network"]}</div>
        </div>
      </div>
    `;
    const div = htmlToElement(html);
    schoolsCompareContainer.append(div);
  }

}

//-----------------------------------------------//
// FUNCTION TO HIGHLIGHT SCHOOLS ON THE MAP
//-----------------------------------------------//

// Enlarge the schools that are highlighted
function highlightSchoolsOnMap(schoolsToCompare) {

  // First, remove the highlighted schools from the regular school points
  let schoolsAfterRemove = schoolsShownOnMap;
  schoolsAfterRemove = schoolsAfterRemove.filter(school =>
    !(schoolsToCompare.includes(school["name"])));

    // Reuse old function to show shools on the map
    showSchoolsOnMap(schoolsAfterRemove, baseMap);

  // Then, re-add the schools in a highlighted way
  const schoolsToHighlight = schoolsShownOnMap.filter(school =>
    schoolsToCompare.includes(school["name"]));
  const highlightSchoolFeatureCollection = {
    "type": "FeatureCollection",
    "features": schoolsToHighlight.map(makeSchoolFeature),
  };
  // For this part, reference school-map.js
  if(baseMap.highlightLayers !== undefined) {
    baseMap.removeLayer(baseMap.highlightLayers);
  }

  baseMap.highlightLayers = L.geoJSON(highlightSchoolFeatureCollection, {
    pointToLayer: (geoJsonPoint, latlng) => L.circleMarker(latlng),
    style: {
      radius: 12,
      color: "#353795",
      fillOpacity: 0.5,
      stroke: true,
      weight: 5,
    },
  })
  .addTo(baseMap)
  .bindPopup(schoolPoint => schoolPoint.feature.properties["school_name"], { "autoClose": false, "popupOpen": true })
  .openPopup();
}

//-----------------------------------------------//
// FUNCTION TO SHOW SCHOOL CATCHMENT AREAS
//-----------------------------------------------//

function showCatchments(schoolsToCompare) {

  // SchoolsToCompare is just a list of names
  // Get the full info of the highlighted schools
  const schoolsToHighlight = schoolsShownOnMap.filter(school =>
    schoolsToCompare.includes(school["name"]));

  // Get the ids of these schools to highlight
  const highlightIds = [];
  for(let school of schoolsToHighlight) {
    highlightIds.push(school["sdp_id"]);
  }

  // Filtering the catchments to show
  let filteredCatchments = Object.assign({}, catchments);
  filteredCatchments.features = filteredCatchments.features.filter(catchment =>
    highlightIds.includes(catchment["id"]));

  // With each new click, the original catchments will be cleared first
  if(baseMap.catchmentLayers != undefined) {
    baseMap.removeLayer(baseMap.catchmentLayers);
  }

  if(baseMap.cityLayer != undefined) {
    baseMap.removeLayer(baseMap.cityLayer);
  }

  // Add the catchments

  // Some schools are not neighborhood schools
  // Therefore, their catchment is Philadelphia
  if(filteredCatchments.features.length < highlightIds.length) {

    // What are the schools that have catchments? Used for the popup
    const catchmentIds = [];
    if(filteredCatchments.features.length > 0) {
      for(let catchment of filteredCatchments.features) {
        catchmentIds.push(catchment["id"]);
      }
    }
    // For the tooltip, add a phrase that says: x, y, and z are not neighborhood schools
    // Find which one is missing or which ones are missing
    const missedSchools = [];

    for(let id of highlightIds) {
      if(!catchmentIds.includes(id)) {
        let missedIndex = schoolsToHighlight.findIndex(school => school.sdp_id == id);
        let missedSchool = schoolsToHighlight[missedIndex]["name"];
        missedSchools.push(missedSchool);
      }
    }

    let phrase;

    // Showing thru Popup which schools have no catchment
    if(missedSchools.length == 1) {
      phrase = missedSchools[0].concat(" is not a neighborhood school.");
    } else if(missedSchools.length == 2) {
      phrase = missedSchools.join(" and ").concat(" are not neighborhood schools.");
    } else {
      let phraseFirst = missedSchools.slice(missedSchools.length - 2).join(", ");
      let phraseAll = phraseFirst.concat(", and ").concat(missedSchools[missedSchools.length - 1]);
      phrase = phraseAll.concat(" are not neighborhood schools");
    }

    baseMap.cityLayer = L.geoJSON(cityLimit, {
      style: {
        color: "#353795",
        fillOpacity: 0.07,
        stroke: true,
        weight: 0.5,
      },
    })
    .bindPopup(phrase)
    .addTo(baseMap);
  }

  // Add catchment layers
  baseMap.catchmentLayers = L.geoJSON(filteredCatchments, {
    style: {
      color: "#353795",
      fillOpacity: 0.07,
      stroke: true,
      weight: 1.7,
    },
  })
  .bindPopup(catchmentPolygon => {
    let thisId = catchmentPolygon.feature["id"];
    let thisIndex = schoolsShownOnMap.findIndex(school =>
      school.sdp_id == thisId);
    let thisSchool = schoolsShownOnMap[thisIndex]["name"];
    return "Catchment of ".concat(thisSchool);
  })
  .addTo(baseMap);

}

//-----------------------------------------------//
// ONCLICK: EVERYTIME NEW HIGHLIGHT/UNHIGHLIGHT HAPPENS
//-----------------------------------------------//

// Function: add listener that highlight school selection triggers other things
// The reason to wrap things up in a function is:
// Everytime we do filter, we need to re-add listener

function prepareHighlight() {

  let schoolsShownInList = document.querySelectorAll(".school-list-item, .school-list-item-clicked");
  for(let schoolShown of schoolsShownInList) {

    if(schoolShown.title != "No Result") {
    // Check if this school is currently highlighted. If so, unhighlight on click
    // We do this by changing the value of the HTML element
    // Originally set to 0; if highlighted, value is set to 1
    schoolShown.addEventListener('click', ( ) => {

      // What happens when something is clicked?
      // 1. Highlight/unhighlight
      // 2. Calculate a list of all currently highlighted schools
      if(schoolShown.value == 0) {
          schoolShown.value = 1;
      } else {
          schoolShown.value = 0;
      }

      // Highlight or unhighlight by changing the CSS class
      schoolShown.className = schoolListItemClassNames[schoolShown.value];

      // Generate the current schools
      const schoolsToCompare = getSchoolsToCompare();

      // If there are schools highlighted, show button
      if(schoolsToCompare.length > 0) {
        document.querySelector(".save-reload").style.display = "block";
      }

      // Show catchments of highlighted schools
      showCatchments(schoolsToCompare);

      // Show highlighted school on the map
      highlightSchoolsOnMap(schoolsToCompare);

      // Show comparing school
      showSchoolsCompare(schoolsToCompare);

      // Save current state to URL
      saveStateToUrl(schoolsToCompare);
    });
    }


  }
}

export{
  prepareHighlight,
  showCatchments,
  highlightSchoolsOnMap,
  showSchoolsCompare,
};

window.catchments = catchments;
window.cityLimit = cityLimit;