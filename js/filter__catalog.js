"use strict";
window.filterCategoryAnimal = function (allProducts) {
  const filterCategoryAnimalItems = document.querySelectorAll(
    ".products__catalog__filter__type__list__item"
  );

  const catalogTitle = document.querySelector(".products__catalog__title");

  const categoryTitles = {
    собаки: "Каталог товаров для собак",
    кошки: "Каталог товаров для кошек",
    грызуны: "Каталог товаров для грызунов",
    птицы: "Каталог товаров для птиц",
    рыбки: "Каталог товаров для рыбок",
  };

  fetch("https://oliver1ck.pythonanywhere.com/api/get_animals_list/")
    .then((response) => response.json())
    .then((animalData) => {
      const animalMap = {};
      for (const animal of animalData.results) {
        animalMap[animal.type.toLowerCase()] = animal.id.toString();
      }

      console.log("Загружен маппинг животных:", animalMap);

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

          if (catalogTitle && categoryTitles[selectedCategory]) {
            catalogTitle.textContent = categoryTitles[selectedCategory];
          }

          const animalId = animalMap[selectedCategory];

          if (!animalId) {
            console.error("Неизвестная категория:", selectedCategory);
            return;
          }

          console.log(
            "ID животного:",
            animalId,
            "для категории:",
            selectedCategory
          );

          const animalItems = document.querySelectorAll(
            ".animal__category__catalog"
          );
          for (const animalItem of animalItems) {
            const animalText = animalItem
              .querySelector(".animal__category__catalog__title")
              .textContent.toLowerCase();
            if (animalText === selectedCategory) {
              for (const item of animalItems) {
                item.classList.remove("animal__category__catalog__active");
              }
              animalItem.classList.add("animal__category__catalog__active");
              break;
            }
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
        });
      }
    })
    .catch((error) => {
      console.error("Ошибка загрузки списка животных:", error);
    });
};
