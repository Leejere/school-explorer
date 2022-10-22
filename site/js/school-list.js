import { htmlToElement } from "./template-tools.js";
import { gradeArr } from './main.js';

function showSchoolsInList(schoolsToShow, schoolList) {
    schoolList.innerHTML = "";
    document.querySelector("#school-list-expand-button").style.display = "none";

    for(const school of schoolsToShow) {
        let thisGradeArr = [];
        for(let grade of gradeArr) {
            if(school[grade] === "1") {
                thisGradeArr.push(grade.substring(6));
            }
        }
        const html = `
            <li class="school-list-item" role="option" title="${school['name']}" value=0>
                <div>${school['name']}</div>
            </li>
        `;
        const li = htmlToElement(html);
        schoolList.append(li);
    }
    if(schoolsToShow.length == 0) {
        const html = `
            <li class="school-list-item" role="option" title="No Result" value=0>
                <div>No Result</div>
            </li>
        `;
        const li = htmlToElement(html);
        schoolList.append(li);
    }

    // Only show expand button when necessary

    let innerContainer = document.querySelector("#school-list");
    let innerHeight = innerContainer.offsetHeight;
    let outerHeight = document.querySelector(".list-container").offsetHeight;

    if(innerHeight > outerHeight) {
        console.log("show button");
        document.querySelector("#school-list-expand-button").style.display = "block";
    }
}

export {
    showSchoolsInList,
};