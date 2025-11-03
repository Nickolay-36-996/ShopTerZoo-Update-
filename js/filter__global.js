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

    const isCatalogPage = window.location.pathname.includes("catalog.html");
    const isIndexPage = window.location.pathname.includes("index.html");

    if (isIndexPage) {
      for (const category of animalList) {
        const animalItem = document.createElement("a");
        animalItem.className = "animal__category__catalog";
        animalItem.style.opacity = "1";
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
    } else if (isCatalogPage) {
      for (const category of animalList) {
        const animalItem = document.createElement("button");
        animalItem.className = "animal__category__catalog";
        animalItem.innerHTML = `
            <img src="${category.image}" alt="${category.title}">
            <p class="animal__category__catalog__title">${category.type}</p>
            `;

        animalContainer.appendChild(animalItem);

        animalItem.addEventListener("click", function () {
          const allAnimalItems = document.querySelectorAll(
            ".animal__category__catalog"
          );

          for (const item of allAnimalItems) {
            item.classList.remove("animal__category__catalog__active");
          }

          this.classList.add("animal__category__catalog__active");

          const selectedCategory = category.type.toLowerCase();
          const filterItems = document.querySelectorAll(
            ".products__catalog__filter__type__list__item"
          );

          for (let filter of filterItems) {
            const filterText = filter
              .querySelector(".products__catalog__filter__type__txt")
              .textContent.toLowerCase();
            if (filterText === selectedCategory) {
              filter.click();
              break;
            }
          }
        });
      }
    }
  };
});
