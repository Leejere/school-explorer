//-----------------------------------------------//
// SETTING THINGS UP, IMPORT WHAT'S IMPORTED
//-----------------------------------------------//

// Import school data
import schools from '../data/schools.js';

// This variable determines which school is shown on the map
// Initially, it is all schools
export let schoolsShownOnMap = schools;

// Import functions related to showing the school map
import { showSchoolsOnMap } from './school-map.js';

import { showSchoolsInList } from './school-list.js';

// Funtion to add event listeners to prepare for highlighting schools in the list
import { prepareHighlight } from './school-compare.js';

// Import useful functions from template-tools
import { htmlToElement } from "./template-tools.js";

// This is an array that starts from "Grade 1" to "Grade 12" and "Grade K"
// It is used to extract certain properties (whether has a certain grade) from schools.js when making a school feature
export const gradeArr = Object.keys(schools[0]).filter(key => {
    if((key.indexOf('Grade') === 0) && (key.length < 9)){
        return true;
    } else {
        return false;
    }
});

//-----------------------------------------------//
// INITIAL SHOWING OF MAP
//-----------------------------------------------//

// First initialize the base map
let schoolMap = document.querySelector("#school-map");
export let baseMap = L.map(schoolMap, { zoomControl: false }).setView([40, -75.15], 11);
// For other map tile styles, see this website:https://leaflet-extras.github.io/leaflet-providers/preview/

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=029695db-b34b-4602-a119-bcf44d2d87d6', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
}).addTo(baseMap);

// Then add school content:
// This is only the initial showing of the school points
// After any selection, the showing of the schools is done from inside the eventListeners
showSchoolsOnMap(schools, baseMap);

//-----------------------------------------------//
// MAKING A LIST OF CHECKBOXES OF ALL THE GRADES
//-----------------------------------------------//

// Add a set of checkboxes of different grades
for(const grade of gradeArr) {
    const html = `
        <li class="grade-select-item" title="${grade}" value=0>
            <div class="grade-select-item-inside">${grade.slice(6)}</div>
        </li>
    `;
    const gradeSelectBox = htmlToElement(html);
    document.querySelector("#grade-select").append(gradeSelectBox);
}


//-----------------------------------------------//
// MAKING A LIST OF SCHOOLS
//-----------------------------------------------//

export let schoolList = document.querySelector('#school-list');

showSchoolsInList(schools, schoolList);
// Add event listener to prepare for highlight
prepareHighlight();

//-----------------------------------------------//
// CHANGE WHAT'S SHOWING ACCORDING TO EVENT LISTENER
//-----------------------------------------------//

// Get all the grade-related checkboxes

let schoolGradeSelectors = document.querySelectorAll(".grade-select-item, .grade-select-item-clicked");
window.schoolGradeSelectors = schoolGradeSelectors;

// Get what's inputted in the Filter By Name input box
let schoolNameFilter = document.querySelector("#school-name-input");

// Filter schools by name
// 10.21: added feature: search word by word
function filterByName(schoolsList) {
    let filteredSchools = schoolsList;
    const inputText = schoolNameFilter.value.toLowerCase();
    const keyWords = inputText.split(" ").map(s => s.replace(/\s/g, ""));
    filteredSchools = filteredSchools.filter(school => {
        let thisName = school["name"].toLowerCase();
        let includesKeyWord = keyWords.map(word => thisName.includes(word));
        return !includesKeyWord.includes(false);
        },
    );
    return filteredSchools;
}

// Filter schools by grade
function filterByGrade(schoolsList) {
    let filteredSchools = schoolsList;
    for (const gradeSelectItem of schoolGradeSelectors) {
        if(gradeSelectItem.value == 1) {
            filteredSchools = filteredSchools.filter(school =>
                school[gradeSelectItem.title] == '1',
            );
        }
    }
    return filteredSchools;
}

// On each one of them, add an event listener
// Everytime a new change is happening, put schoollist through the two filters
// Also, add event listener to the newly created HTMLs

let gradeSelectItemClassNames = ['grade-select-item', 'grade-select-item-clicked'];

for(const gradeSelectItem of schoolGradeSelectors) {
    gradeSelectItem.addEventListener("click", ( ) => {
        if(gradeSelectItem.value == 0) {
            gradeSelectItem.value = 1;
        } else {
            gradeSelectItem.value = 0;
        }
        gradeSelectItem.className = gradeSelectItemClassNames[gradeSelectItem.value];
        schoolsShownOnMap = filterByGrade(filterByName(schools));
        showSchoolsOnMap(schoolsShownOnMap, baseMap);
        showSchoolsInList(schoolsShownOnMap, schoolList);

        prepareHighlight();
    });
}

// Add event listener to the input box
// Everytime a new change is happening, put schoollist through the two filters
schoolNameFilter.addEventListener('input', ( ) => {
    schoolsShownOnMap = filterByGrade(filterByName(schools));
    showSchoolsOnMap(schoolsShownOnMap, baseMap);
    showSchoolsInList(schoolsShownOnMap, schoolList);

    // PrepareHighlight is to add an event listener to every listed school
    // Everytime the list changes, we need to re-add listeners
    prepareHighlight();
});

let legend = L.control({ position: "bottomright" });
legend.onAdd = function(map) {
    let div = L.DomUtil.create("div", "legend");
    div.innerHTML += "Test";
    return div;
};

legend.addTo(baseMap);

window.schools = schools;
window.gradeArr = gradeArr;
window.schoolList = schoolList;
window.schoolNameFilter = schoolNameFilter;
window.schoolsShownOnMap = schoolsShownOnMap;