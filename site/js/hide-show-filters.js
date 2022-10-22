// Whether the expand list button is clicked
import { clicked } from "./expand-list.js";

let hideButton = document.querySelector("#hide-button");
let showButton = document.querySelector("#show-button");
let hidableChunk = document.querySelector("#hidable-chunk");

export let hidden = 0;

hideButton.addEventListener("click", ( ) => {
  hidableChunk.style.display = "none";
  showButton.style.display = "block";
  hidden = 1;

  const mediaQuery = window.matchMedia("(max-width: 1200px)");
  if(mediaQuery.matches) {
    document.querySelector("#school-compare-container").style.maxHeight = "40vh";
  }

});

showButton.addEventListener("click", ( ) => {
  hidableChunk.style.display = "block";
  showButton.style.display = "none";
  hidden = 0;

  document.querySelector("#school-compare-container").style.maxHeight = "60vh";
  const mediaQuery = window.matchMedia("(max-width: 1200px)");
  if(mediaQuery.matches) {
    document.querySelector("#school-compare-container").style.maxHeight = "45vh";
    if(clicked == 1) {
      document.querySelector("#school-compare-container").style.maxHeight = "35vh";
    }
  }
});
