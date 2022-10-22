import { htmlToElement } from "./template-tools.js";

let button = document.querySelector("#school-list-expand-button");
export let clicked;
clicked = 0;
let listContainer = document.querySelector(".list-container, .list-container-expanded");

let listContainerClassNames = ["list-container", "list-container-expanded"];

button.addEventListener("click", ( ) => {
  console.log("clicked!");
  if(clicked == 0) {
    clicked = 1;

    // If unexpanded before, expand, then reverse the symbol
    button.innerHTML = `<span class="material-symbols-outlined">expand_less</span>`;

    // If list expanded, then school compare's max height should be adjusted to smaller
    // Only applied to small screens
    const mediaQuery = window.matchMedia("(max-width: 1200px)");
    if(mediaQuery.matches) {
      document.querySelector("#school-compare-container").style.maxHeight = "35vh";
    }
  } else {
    clicked = 0;
    button.innerHTML = `<span class="material-symbols-outlined">expand_more</span>`;
  }
  // Make listContainer expand
  listContainer.className = listContainerClassNames[clicked];
});

