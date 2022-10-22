import { schoolsShownOnMap } from "./main.js";
import schools from "../data/schools.js";
import {
  showCatchments,
  highlightSchoolsOnMap,
  showSchoolsCompare,
} from "./school-compare.js";
import { showSchoolsOnMap } from "./school-map.js";
import { showSchoolsInList } from "./school-list.js";
import { baseMap } from "./main.js";
import { schoolList } from "./main.js";

//-----------------------------------------------//
// FUNCTION TO SAVE CURRENT STATE INTO AN URL
//-----------------------------------------------//

// This function takes schoolsToCompare, which is an arr of names of highlighted schools
function saveStateToUrl(schoolsToCompare) {

  // Turn the arr of school names into school id's:
  // First, get the full info of the highlighted schools
  const schoolsToHighlight = schoolsShownOnMap.filter(school =>
    schoolsToCompare.includes(school["name"]));

  // Get the ids of these schools to highlight
  const highlightIds = [];
  for(let school of schoolsToHighlight) {
    highlightIds.push(school["sdp_id"]);
  }

  const highlightIdArr = highlightIds.join(",");

  // Generate an URL
  window.location.hash = highlightIdArr;
  console.log(window.location.toString());
}

//-----------------------------------------------//
// FUNCTION TO LOAD THE CURRENT STATE
//-----------------------------------------------//

// This function takes in a hash url and shows only the selected schools
function loadState() {

  // Get current hash
  let urlHash = window.location.hash.substring(1, window.location.hash.length);
  if(urlHash !== undefined && urlHash !== "") {
    // Get array of ID's we're interested in
    let idArr = urlHash.split(",");
    // Get array of schools objects
    let schoolsSelected = schools.filter(school => idArr.includes(school["sdp_id"]));
    // Get array of school names
    let schoolsSelectedNameArr = [];

    for(let school of schoolsSelected) {
      schoolsSelectedNameArr.push(school["name"]);
    }

    // Step 1: Show catchment area
    showCatchments(schoolsSelectedNameArr);
    // Step 2: Highlight selected schools on the map
    highlightSchoolsOnMap(schoolsSelectedNameArr);
    // Step 3: Show compare
    showSchoolsCompare(schoolsSelectedNameArr);

    let schoolsToShow = schools.filter(school => schoolsSelectedNameArr.includes(school["name"]));
    showSchoolsOnMap(schoolsToShow, baseMap);
    showSchoolsInList(schoolsToShow, schoolList);
    document.querySelector(".save-reload").style.display = "block";
    window.schoolsToShow = schoolsToShow;

  }
}

//-----------------------------------------------//
// CLICK TO COPY NEWLY CREATED URL
//-----------------------------------------------//

let urlHash = window.location.hash.substring(1, window.location.hash.length);
let copyButton = document.querySelector("#click-to-copy-url");
copyButton.addEventListener("click", ( ) => {
  navigator.clipboard.writeText("https://leejere.github.io/school-explorer/site/index.html#".concat(urlHash));
  copyButton.innerHTML = `Share Selection<span class="tooltiptext">Copied selection URL</span>`;
});

window.onload = loadState;

export { saveStateToUrl };