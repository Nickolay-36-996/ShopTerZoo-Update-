"use strict";
document.addEventListener("DOMContentLoaded", () => {
  let animalList = [];

  fetch("https://oliver1ck.pythonanywhere.com/api/get_animals_list/")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("animal list:", data);
      animalList = data.results;
      animalFilter(animalList);
    })
    .catch((error) => {
      console.error("Ошибка fetch:", error);
    });

  window.animalFilter = function (animalList) {
    const animalContainer = document.getElementById("animals-list");

    for (const category of animalList) {
      const animalItem = document.createElement("a");
      animalItem.className = "animal__category__catalog";
      animalItem.href = `catalog.html?animal=${category.type.toLowerCase()}`;
      animalItem.innerHTML = `
            <img src="${category.image}" alt="${category.title}">
            <p class="animal__category__catalog__title">${category.type}</p>
            `;

      animalContainer.appendChild(animalItem);

      animalItem.addEventListener("click", function () {
        const selectedCategory = category.type.toLowerCase();
        localStorage.setItem("autoFilterCategory", selectedCategory);
      });
    }
  };
});
