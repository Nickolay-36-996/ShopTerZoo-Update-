"use strict";
window.filterCategoryAnimal = function () {
  const filterCategoryAnimalItems = document.querySelectorAll(
    ".products__catalog__filter__type__list__item"
  );

  const animalFilterMap = {
    собаки: "1",
    кошки: "2",
    грызуны: "3",
    птицы: "4",
    рыбки: "5",
  };

  for (const animalItem of filterCategoryAnimalItems) {
    animalItem.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const allIndicators = document.querySelectorAll(
        ".products__catalog__filter__type__indicator"
      );
      for (const indicator of allIndicators) {
        indicator.classList.remove(
          "products__catalog__filter__type__indicator__active"
        );
      }

      const currentIndicator = this.querySelector(
        ".products__catalog__filter__type__indicator"
      );
      if (currentIndicator) {
        currentIndicator.classList.add(
          "products__catalog__filter__type__indicator__active"
        );
      }

      const categoryNameElement = this.querySelector(
        ".products__catalog__filter__type__txt"
      );
      const selectedCategory = categoryNameElement.textContent
        .trim()
        .toLowerCase();

      const animalId = animalFilterMap[selectedCategory];

      if (!animalId) {
        console.error("Неизвестная категория:", selectedCategory);
        return;
      }

      const apiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&page=1`;

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (typeof window.productItems === "function") {
            window.productItems(data.results);
          } else {
            console.error("Функция productItems не найдена!");
          }

          if (typeof window.updatePagination === "function") {
            window.updatePagination(data, 1, apiUrl.replace("&page=1", ""));
          }
        })
        .catch((error) => {
          console.error("Ошибка загрузки отфильтрованных товаров:", error);
        });
    });
  }
};

window.applyAnimalFilter = function (selectedCategory) {
  const animalFilterMap = {
    собаки: "1",
    кошки: "2",
    грызуны: "3",
    птицы: "4",
    рыбки: "5",
  };

  const animalId = animalFilterMap[selectedCategory];

  if (!animalId) {
    console.error("Неизвестная категория:", selectedCategory);
    return;
  }

  const apiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&page=1`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (typeof window.productItems === "function") {
        window.productItems(data.results);
      }

      if (typeof window.updatePagination === "function") {
        window.updatePagination(data, 1, apiUrl.replace("&page=1", ""));
      }
    })
    .catch((error) => {
      console.error("Ошибка загрузки отфильтрованных товаров:", error);
    });
};
