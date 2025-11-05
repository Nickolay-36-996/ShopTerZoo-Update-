"use strict";
window.filterCategoryAnimal = function () {
  const filterCategoryAnimalItems = document.querySelectorAll(
    ".products__catalog__filter__type__list__item"
  );
  const filterAnimalList = document.querySelector(
    ".products__catalog__filter__type__list"
  );
  const filterContainer = document.querySelector(
    ".products__catalog__filter__type"
  );
  const catalogTitle = document.querySelector(".products__catalog__title");
  const typeTitle = document.querySelector(".products__catalog__filter__title");

  const animalFilterMap = {
    собаки: "1",
    кошки: "2",
    грызуны: "3",
    птицы: "4",
    рыбки: "5",
  };

  const categoryTitles = {
    собаки: "Каталог товаров для собак",
    кошки: "Каталог товаров для кошек",
    грызуны: "Каталог товаров для грызунов",
    птицы: "Каталог товаров для птиц",
    рыбки: "Каталог товаров для рыбок",
  };

  const productTypesMap = {
    собаки: [
      { category: "Корм", subcategory: ["Влажный корм", "Сухой корм"] },
      { category: "Игрушки" },
      { category: "Переноски" },
      { category: "Посуда" },
      { category: "Клетки" },
    ],

    кошки: [
      { category: "Корм", subcategory: ["Влажный корм", "Сухой корм"] },
      {
        category: "Наполнители",
        subcategory: ["Впитывающий", "Древесный", "Комкующийся"],
      },
      { category: "Игрушки" },
      { category: "Переноски" },
      { category: "Гигиена и косметика" },
      { category: "Посуда" },
      { category: "Когтеточки" },
    ],

    грызуны: [
      { category: "Корм", subcategory: ["Сухой корм"] },
      {
        category: "Наполнители",
        subcategory: ["Сено", "Песок"],
      },
      { category: "Акссесуары" },
      { category: "Посуда" },
      { category: "Клетки" },
    ],

    птицы: [
      { category: "Корм", subcategory: ["Сухой корм"] },
      { category: "Акссесуары" },
      { category: "Посуда" },
      { category: "Клетки" },
    ],

    рыбки: [
      { category: "Корм", subcategory: ["Корм для рыб"] },
      { category: "Акссесуары" },
      { category: "Аквариумы" },
      { category: "Оборудование" },
    ],
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

      if (catalogTitle && categoryTitles[selectedCategory]) {
        catalogTitle.textContent = categoryTitles[selectedCategory];
      }

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

      const animalId = animalFilterMap[selectedCategory];
      if (!animalId) return;

      const apiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&page=1`;

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
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

      function updateTypeList(selectedCategory) {
        const categoryTypes = productTypesMap[selectedCategory];

        if (typeTitle) {
          typeTitle.textContent = "Тип товара";
        }

        if (filterAnimalList && categoryTypes) {
          filterAnimalList.style.display = "none";

          const oldFilterTypeList = document.querySelector(
            ".filter__type__list"
          );
          if (oldFilterTypeList) {
            oldFilterTypeList.remove();
          }

          const filterTypeList = document.createElement("div");
          filterTypeList.className = "filter__type__list";
          filterContainer.appendChild(filterTypeList);

          for (const type of categoryTypes) {
            if (type.subcategory && type.subcategory.length > 0) {
              const isSubcategory = type.subcategory
                .map((item) => {
                  return `
                <div class="food__subcategory__item">
                <div class="products__catalog__filter__brand__indicator"></div>
                <p class="products__catalog__filter__brand__txt">${item}</p>
                </div>
                `;
                })
                .join("");

              const listItem = document.createElement("li");
              listItem.className = "food__category__item";
              listItem.innerHTML = `
              <div class="food__category__contain">
              <div class="products__catalog__filter__type__indicator"></div>
              <p class="products__catalog__filter__type__txt">${type.category}</p>
              </div>
              <div class="food__subcategories__list">${isSubcategory}</div>
              `;

              filterTypeList.appendChild(listItem);
            } else {
              const listItem = document.createElement("li");
              listItem.className =
                "products__catalog__filter__type__list__item";
              listItem.innerHTML = `
            <div class="products__catalog__filter__type__indicator"></div>
            <p class="products__catalog__filter__type__txt">${type.category}</p>
            `;

              filterTypeList.appendChild(listItem);
            }
          }
        }
      }

      updateTypeList(selectedCategory);
    });
  }
};
