"use strict";
window.selectedBrands = [];

window.getAllFilteredProducts = async function (animalId) {
  let allProducts = [];
  let nextUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&page=1`;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl);
      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        allProducts = [...allProducts, ...data.results];
      }
      nextUrl = data.next;
    }

    console.log(
      `Загружены все товары категории животного: ${allProducts.length} шт.`
    );
    localStorage.setItem("catalogFilters", JSON.stringify(allProducts));
    return allProducts;
  } catch (error) {
    console.error("Ошибка загрузки товаров категории:", error);
    return [];
  }
};

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

      const parentList = this.closest(".products__catalog__filter__type__list");
      const isMainAnimalList =
        parentList && !parentList.classList.contains("filter__type__list");

      const currentIndicator = this.querySelector(
        ".products__catalog__filter__type__indicator"
      );

      const isAlreadyActive =
        currentIndicator &&
        currentIndicator.classList.contains(
          "products__catalog__filter__type__indicator__active"
        );

      if (isAlreadyActive && isMainAnimalList) {
        if (
          window.currentOrder &&
          window.currentOrder !== "order=date_create"
        ) {
          window.currentOrder = "order=date_create";
          const selectFilterActive = document.querySelector(
            ".products__catalog__sort__select__active"
          );
          if (selectFilterActive) {
            selectFilterActive.textContent = "дате добавления";
          }
        }

        const promotionalIndicator = document.querySelector(
          ".promotional__item__indicator"
        );
        if (promotionalIndicator) {
          promotionalIndicator.classList.remove(
            "promotional__item__indicator__active"
          );
        }

        window.selectedBrands = [];
        const allBrandIndicators = document.querySelectorAll(
          ".products__catalog__filter__brand__indicator"
        );
        for (const indicator of allBrandIndicators) {
          indicator.classList.remove(
            "products__catalog__filter__brand__indicator__active"
          );
        }

        const allSubcategoryIndicators = document.querySelectorAll(
          ".products__catalog__filter__subcategory__indicator"
        );
        for (const indicator of allSubcategoryIndicators) {
          indicator.classList.remove(
            "products__catalog__filter__subcategory__indicator__active"
          );
        }

        const allCategoryIndicators = document.querySelectorAll(
          ".products__catalog__filter__type__indicator__active"
        );
        for (const indicator of allCategoryIndicators) {
          indicator.classList.remove(
            "products__catalog__filter__type__indicator__active"
          );
        }

        const animalText = this.querySelector(
          ".products__catalog__filter__type__txt"
        )
          .textContent.trim()
          .toLowerCase();
        const animalFilterMap = {
          собаки: "1",
          кошки: "2",
          грызуны: "3",
          птицы: "4",
          рыбки: "5",
        };
        const animalId = animalFilterMap[animalText];

        if (animalId) {
          const url = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&page=1`;

          fetch(url)
            .then((response) => {
              if (!response.ok)
                throw new Error(`HTTP status: ${response.status}`);
              return response.json();
            })
            .then((data) => {
              if (typeof window.productItems === "function") {
                window.productItems(data.results);
              }
              if (typeof window.updatePagination === "function") {
                window.updatePagination(data, 1, url.replace("&page=1", ""));
              }
              if (typeof window.filterBrandProducts === "function") {
                window.filterBrandProducts(animalId);
              }
            })
            .catch((error) => {
              console.error("Ошибка загрузки товаров:", error);
            });
        }

        return;
      }

      if (
        isMainAnimalList &&
        window.currentOrder &&
        window.currentOrder !== "order=date_create"
      ) {
        window.currentOrder = "order=date_create";

        const selectFilterActive = document.querySelector(
          ".products__catalog__sort__select__active"
        );
        if (selectFilterActive) {
          selectFilterActive.textContent = "дате добавления";
        }
      }

      const allIndicators = document.querySelectorAll(
        ".products__catalog__filter__type__indicator"
      );

      for (const indicator of allIndicators) {
        indicator.classList.remove(
          "products__catalog__filter__type__indicator__active"
        );
      }

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

      getAllFilteredProducts(animalId).then((allFilteredProducts) => {
        updateTypeList(
          selectedCategory,
          allFilteredProducts,
          animalId,
          allFilteredProducts
        );

        let brandFilter = "";
        if (window.selectedBrands.length > 0) {
          for (const brandId of window.selectedBrands) {
            brandFilter += `&brand_id__in=${brandId}`;
          }
        }

        let finalApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
          window.currentOrder || "order=date_create"
        }&animal__in=${animalId}${brandFilter}&page=1`;

        const isPromotionalActive = document
          .querySelector(".promotional__item__indicator")
          ?.classList.contains("promotional__item__indicator__active");
        if (isPromotionalActive) {
          finalApiUrl += "&sale__percent__gt=0";
        }

        fetch(finalApiUrl)
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP status: ${response.status}`);
            return response.json();
          })
          .then((data) => {
            if (typeof window.productItems === "function") {
              window.productItems(data.results);
            }
            if (typeof window.updatePagination === "function") {
              window.updatePagination(
                data,
                1,
                finalApiUrl.replace("&page=1", "")
              );
            }
          })
          .catch((error) => {
            console.error("Ошибка загрузки отфильтрованных товаров:", error);
          });

        window.filterBrandProducts(animalId);
      });

      function updateTypeList(
        selectedCategory,
        data,
        animalId,
        allFilteredProducts
      ) {
        const categoryTypes = productTypesMap[selectedCategory];

        if (typeTitle) {
          typeTitle.textContent = "Тип товара";
        }

        if (typeof window.applyFiltersForMobile === "function") {
          window.applyFiltersForMobile();
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

          filterTypeList.addEventListener("click", function (e) {
            const subcategoryItem = e.target.closest(
              ".food__subcategory__item"
            );
            if (subcategoryItem) {
              e.stopPropagation();
              e.preventDefault();

              if (window.innerWidth <= 992) {
                const currentSubcategoryIndicator =
                  subcategoryItem.querySelector(
                    ".products__catalog__filter__subcategory__indicator"
                  );

                currentSubcategoryIndicator.classList.toggle(
                  "products__catalog__filter__subcategory__indicator__active"
                );

                const parentCategory = subcategoryItem.closest(
                  ".food__category__item"
                );
                const parentIndicator = parentCategory.querySelector(
                  ".products__catalog__filter__type__indicator"
                );

                const activeSubcategoriesInParent =
                  parentCategory.querySelectorAll(
                    ".products__catalog__filter__subcategory__indicator__active"
                  );

                if (activeSubcategoriesInParent.length > 0) {
                  parentIndicator.classList.add(
                    "products__catalog__filter__type__indicator__active"
                  );
                } else {
                  parentIndicator.classList.remove(
                    "products__catalog__filter__type__indicator__active"
                  );
                }

                return;
              }

              const allCategoryIndicators = document.querySelectorAll(
                ".products__catalog__filter__type__indicator"
              );
              for (const categoryIndicator of allCategoryIndicators) {
                categoryIndicator.classList.remove(
                  "products__catalog__filter__type__indicator__active"
                );
              }

              const currentSubcategoryIndicator = subcategoryItem.querySelector(
                ".products__catalog__filter__subcategory__indicator"
              );

              if (currentSubcategoryIndicator) {
                currentSubcategoryIndicator.classList.toggle(
                  "products__catalog__filter__subcategory__indicator__active"
                );

                const parentCategory = subcategoryItem.closest(
                  ".food__category__item"
                );
                const parentIndicator = parentCategory.querySelector(
                  ".products__catalog__filter__type__indicator"
                );

                const activeSubcategoriesInParent =
                  parentCategory.querySelectorAll(
                    ".products__catalog__filter__subcategory__indicator__active"
                  );

                if (activeSubcategoriesInParent.length > 0) {
                  parentIndicator.classList.add(
                    "products__catalog__filter__type__indicator__active"
                  );
                } else {
                  parentIndicator.classList.remove(
                    "products__catalog__filter__type__indicator__active"
                  );
                }

                const allActiveSubcategories = filterTypeList.querySelectorAll(
                  ".products__catalog__filter__subcategory__indicator__active"
                );

                let categoryFilters = "";

                for (const activeIndicator of allActiveSubcategories) {
                  const activeSubcategoryItem = activeIndicator.closest(
                    ".food__subcategory__item"
                  );
                  const subcategoryText = activeSubcategoryItem
                    .querySelector(".products__catalog__filter__brand__txt")
                    .textContent.trim();

                  const foundProduct = allFilteredProducts.find((item) => {
                    return (
                      item.category && item.category.name === subcategoryText
                    );
                  });

                  const typeId =
                    foundProduct && foundProduct.category
                      ? foundProduct.category.id
                      : "";

                  if (typeId) {
                    categoryFilters += `&category__in=${typeId}`;
                  }
                }

                let brandFilter = "";
                if (window.selectedBrands.length > 0) {
                  for (const brandId of window.selectedBrands) {
                    brandFilter += `&brand_id__in=${brandId}`;
                  }
                }

                let finalTypeApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
                  window.currentOrder || "order=date_create"
                }&animal__in=${animalId}${categoryFilters}${brandFilter}&page=1`;

                const isPromotionalActive = document
                  .querySelector(".promotional__item__indicator")
                  ?.classList.contains("promotional__item__indicator__active");
                if (isPromotionalActive) {
                  finalTypeApiUrl += "&sale__percent__gt=0";
                }

                fetch(finalTypeApiUrl)
                  .then((response) => {
                    if (!response.ok)
                      throw new Error(`HTTP status: ${response.status}`);
                    return response.json();
                  })
                  .then((filteredData) => {
                    if (typeof window.productItems === "function") {
                      window.productItems(filteredData.results);
                    }
                    if (typeof window.updatePagination === "function") {
                      window.updatePagination(
                        filteredData,
                        1,
                        finalTypeApiUrl.replace("&page=1", "")
                      );
                    }
                    window.filterBrandProducts(animalId);
                  })
                  .catch((error) => {
                    console.error(
                      "Ошибка загрузки отфильтрованных товаров:",
                      error
                    );
                  });
              }
            }
          });

          for (const type of categoryTypes) {
            if (type.subcategory && type.subcategory.length > 0) {
              let totalCategoryCount = 0;
              const subcategoryCounts = {};

              for (const subcategoryName of type.subcategory) {
                const subcategoryProducts = allFilteredProducts.filter(
                  (product) => {
                    return (
                      product.category &&
                      product.category.name === subcategoryName
                    );
                  }
                );
                const subcategoryCount = subcategoryProducts.length;
                subcategoryCounts[subcategoryName] = subcategoryCount;
                totalCategoryCount += subcategoryCount;
              }

              const hasPromotion = allFilteredProducts.some((item) => {
                return (
                  item.sale &&
                  item.sale.percent > 0 &&
                  type.subcategory.includes(item.category?.name)
                );
              });

              const isSubcategory = type.subcategory
                .map((subcategoryName) => {
                  const subcategoryCount =
                    subcategoryCounts[subcategoryName] || 0;
                  const hasSubcategoryPromotion = allFilteredProducts.some(
                    (item) => {
                      return (
                        item.sale &&
                        item.sale.percent > 0 &&
                        item.category?.name === subcategoryName
                      );
                    }
                  );

                  return `
            <div class="food__subcategory__item">
              <div class="products__catalog__filter__subcategory__indicator"></div>
              <p class="products__catalog__filter__brand__txt">${subcategoryName}</p>
              <span class="products__catalog__filter__type__count">(${subcategoryCount})</span>
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
          <span class="products__catalog__filter__type__count">(${totalCategoryCount})</span>
          ${
            hasPromotion
              ? `<span class="products__catalog__filter__type__sale">Акция</span>`
              : ""
          }
        </div>
        <div class="food__subcategories__list">${isSubcategory}</div>
        `;

              filterTypeList.appendChild(listItem);

              const categoryContain = listItem.querySelector(
                ".food__category__contain"
              );
              categoryContain.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (window.innerWidth <= 992) {
                  const parentIndicator = this.querySelector(
                    ".products__catalog__filter__type__indicator"
                  );

                  parentIndicator.classList.toggle(
                    "products__catalog__filter__type__indicator__active"
                  );

                  const subcategoryIndicators = listItem.querySelectorAll(
                    ".products__catalog__filter__subcategory__indicator"
                  );

                  if (
                    parentIndicator.classList.contains(
                      "products__catalog__filter__type__indicator__active"
                    )
                  ) {
                    for (const indicator of subcategoryIndicators) {
                      indicator.classList.add(
                        "products__catalog__filter__subcategory__indicator__active"
                      );
                    }
                  } else {
                    for (const indicator of subcategoryIndicators) {
                      indicator.classList.remove(
                        "products__catalog__filter__subcategory__indicator__active"
                      );
                    }
                  }

                  return;
                }

                const parentIndicator = this.querySelector(
                  ".products__catalog__filter__type__indicator"
                );
                const isAlreadyActive = parentIndicator.classList.contains(
                  "products__catalog__filter__type__indicator__active"
                );

                if (isAlreadyActive) {
                  const otherParentIndicator = document.querySelectorAll(
                    ".products__catalog__filter__type__indicator"
                  );
                  for (const indicator of otherParentIndicator) {
                    indicator.classList.remove(
                      "products__catalog__filter__type__indicator__active"
                    );
                  }

                  const subcategoryIndicators = listItem.querySelectorAll(
                    ".products__catalog__filter__subcategory__indicator"
                  );
                  for (const indicator of subcategoryIndicators) {
                    indicator.classList.remove(
                      "products__catalog__filter__subcategory__indicator__active"
                    );
                  }

                  const resetApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&page=1`;

                  fetch(resetApiUrl)
                    .then((response) => {
                      if (!response.ok)
                        throw new Error(`HTTP status: ${response.status}`);
                      return response.json();
                    })
                    .then((filteredData) => {
                      if (typeof window.productItems === "function") {
                        window.productItems(filteredData.results);
                      }
                      if (typeof window.updatePagination === "function") {
                        window.updatePagination(
                          filteredData,
                          1,
                          resetApiUrl.replace("&page=1", "")
                        );
                      }
                    })
                    .catch((error) => {
                      console.error(
                        "Ошибка загрузки отфильтрованных товаров:",
                        error
                      );
                    });

                  return;
                }

                const otherParentIndicator = document.querySelectorAll(
                  ".products__catalog__filter__type__indicator"
                );
                for (const indicator of otherParentIndicator) {
                  indicator.classList.remove(
                    "products__catalog__filter__type__indicator__active"
                  );
                }

                parentIndicator.classList.toggle(
                  "products__catalog__filter__type__indicator__active"
                );

                const subcategoryIndicators = listItem.querySelectorAll(
                  ".products__catalog__filter__subcategory__indicator"
                );

                if (
                  parentIndicator.classList.contains(
                    "products__catalog__filter__type__indicator__active"
                  )
                ) {
                  for (const indicator of subcategoryIndicators) {
                    indicator.classList.add(
                      "products__catalog__filter__subcategory__indicator__active"
                    );
                  }
                } else {
                  for (const indicator of subcategoryIndicators) {
                    indicator.classList.remove(
                      "products__catalog__filter__subcategory__indicator__active"
                    );
                  }
                }

                const allActiveSubcategories = filterTypeList.querySelectorAll(
                  ".products__catalog__filter__subcategory__indicator__active"
                );

                let categoryFilters = "";

                for (const activeIndicator of allActiveSubcategories) {
                  const activeSubcategoryItem = activeIndicator.closest(
                    ".food__subcategory__item"
                  );
                  const subcategoryText = activeSubcategoryItem
                    .querySelector(".products__catalog__filter__brand__txt")
                    .textContent.trim();

                  const foundProduct = allFilteredProducts.find((item) => {
                    return (
                      item.category && item.category.name === subcategoryText
                    );
                  });

                  const typeId =
                    foundProduct && foundProduct.category
                      ? foundProduct.category.id
                      : "";

                  if (typeId) {
                    categoryFilters += `&category__in=${typeId}`;
                  }
                }

                let brandFilter = "";
                if (window.selectedBrands.length > 0) {
                  for (const brandId of window.selectedBrands) {
                    brandFilter += `&brand_id__in=${brandId}`;
                  }
                }

                let finalTypeApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
                  window.currentOrder || "order=date_create"
                }&animal__in=${animalId}${categoryFilters}${brandFilter}&page=1`;

                const isPromotionalActive = document
                  .querySelector(".promotional__item__indicator")
                  ?.classList.contains("promotional__item__indicator__active");
                if (isPromotionalActive) {
                  finalTypeApiUrl += "&sale__percent__gt=0";
                }

                fetch(finalTypeApiUrl)
                  .then((response) => {
                    if (!response.ok)
                      throw new Error(`HTTP status: ${response.status}`);
                    return response.json();
                  })
                  .then((filteredData) => {
                    if (typeof window.productItems === "function") {
                      window.productItems(filteredData.results);
                    }
                    if (typeof window.updatePagination === "function") {
                      window.updatePagination(
                        filteredData,
                        1,
                        finalTypeApiUrl.replace("&page=1", "")
                      );
                    }
                    window.filterBrandProducts(animalId);
                  })
                  .catch((error) => {
                    console.error(
                      "Ошибка загрузки отфильтрованных товаров:",
                      error
                    );
                  });
              });
            } else {
              const countProducts = allFilteredProducts.filter((product) => {
                return (
                  product.category && product.category.name === type.category
                );
              });
              const countProductsElement = countProducts.length;
              const hasPromotion = countProducts.some((item) => {
                return item.sale && item.sale.percent > 0;
              });

              const listItem = document.createElement("li");
              listItem.className =
                "products__catalog__filter__type__list__item";
              listItem.innerHTML = `
        <div class="products__catalog__filter__type__indicator"></div>
        <p class="products__catalog__filter__type__txt">${type.category}</p>
        <span class="products__catalog__filter__type__count">(${countProductsElement})</span>
        ${
          hasPromotion
            ? `
          <span class="products__catalog__filter__type__sale">Акция</span>
          `
            : ""
        }
        `;

              filterTypeList.appendChild(listItem);

              listItem.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (window.innerWidth <= 992) {
                  const currentIndicator = this.querySelector(
                    ".products__catalog__filter__type__indicator"
                  );
                  const categoryIndicators = document.querySelectorAll(
                    ".products__catalog__filter__type__indicator"
                  );
                  for (const indicator of categoryIndicators) {
                    indicator.classList.remove(
                      "products__catalog__filter__type__indicator__active"
                    );
                  }

                  currentIndicator.classList.add(
                    "products__catalog__filter__type__indicator__active"
                  );

                  return;
                }

                const currentIndicator = this.querySelector(
                  ".products__catalog__filter__type__indicator"
                );
                const isAlreadyActive = currentIndicator.classList.contains(
                  "products__catalog__filter__type__indicator__active"
                );

                if (isAlreadyActive) {
                  const typeIndicators = filterTypeList.querySelectorAll(
                    ".products__catalog__filter__type__indicator"
                  );
                  for (const indicator of typeIndicators) {
                    indicator.classList.remove(
                      "products__catalog__filter__type__indicator__active"
                    );
                  }

                  const allActiveSubcategoryIndicators =
                    document.querySelectorAll(
                      ".products__catalog__filter__subcategory__indicator__active"
                    );
                  for (const indicator of allActiveSubcategoryIndicators) {
                    indicator.classList.remove(
                      "products__catalog__filter__subcategory__indicator__active"
                    );
                  }

                  const resetApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
                    window.currentOrder || "order=date_create"
                  }&animal__in=${animalId}&page=1`;

                  fetch(resetApiUrl)
                    .then((response) => {
                      if (!response.ok)
                        throw new Error(`HTTP status: ${response.status}`);
                      return response.json();
                    })
                    .then((filteredData) => {
                      if (typeof window.productItems === "function") {
                        window.productItems(filteredData.results);
                      }
                      if (typeof window.updatePagination === "function") {
                        window.updatePagination(
                          filteredData,
                          1,
                          resetApiUrl.replace("&page=1", "")
                        );
                      }
                    })
                    .catch((error) => {
                      console.error(
                        "Ошибка загрузки отфильтрованных товаров:",
                        error
                      );
                    });

                  return;
                }

                const allActiveSubcategoryIndicators =
                  document.querySelectorAll(
                    ".products__catalog__filter__subcategory__indicator__active"
                  );
                for (const indicator of allActiveSubcategoryIndicators) {
                  indicator.classList.remove(
                    "products__catalog__filter__subcategory__indicator__active"
                  );
                }

                const typeIndicators = filterTypeList.querySelectorAll(
                  ".products__catalog__filter__type__indicator"
                );
                for (const indicator of typeIndicators) {
                  indicator.classList.remove(
                    "products__catalog__filter__type__indicator__active"
                  );
                }

                currentIndicator.classList.add(
                  "products__catalog__filter__type__indicator__active"
                );

                const typeElement = this.querySelector(
                  ".products__catalog__filter__type__txt"
                );
                const typeName = typeElement.textContent.trim();

                const foundProduct = allFilteredProducts.find((item) => {
                  return item.category && item.category.name === typeName;
                });

                const typeId =
                  foundProduct && foundProduct.category
                    ? foundProduct.category.id
                    : "";

                if (typeId) {
                  let brandFilter = "";
                  if (window.selectedBrands.length > 0) {
                    for (const brandId of window.selectedBrands) {
                      brandFilter += `&brand_id__in=${brandId}`;
                    }
                  }

                  let finalTypeApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
                    window.currentOrder || "order=date_create"
                  }&animal__in=${animalId}&category__in=${typeId}${brandFilter}&page=1`;

                  const isPromotionalActive = document
                    .querySelector(".promotional__item__indicator")
                    ?.classList.contains(
                      "promotional__item__indicator__active"
                    );
                  if (isPromotionalActive) {
                    finalTypeApiUrl += "&sale__percent__gt=0";
                  }

                  fetch(finalTypeApiUrl)
                    .then((response) => {
                      if (!response.ok)
                        throw new Error(`HTTP status: ${response.status}`);
                      return response.json();
                    })
                    .then((filteredData) => {
                      if (typeof window.productItems === "function") {
                        window.productItems(filteredData.results);
                      }
                      if (typeof window.updatePagination === "function") {
                        window.updatePagination(
                          filteredData,
                          1,
                          finalTypeApiUrl.replace("&page=1", "")
                        );
                      }
                      window.filterBrandProducts(animalId);
                    })
                    .catch((error) => {
                      console.error(
                        "Ошибка загрузки отфильтрованных товаров:",
                        error
                      );
                    });
                }
              });
            }
          }
        }
        promotionalFilter();
      }
    });
  }
};

window.filterBrandProducts = function (animalId = null) {
  const filterBrandDisplay = document.querySelector(
    ".products__catalog__filter__brand"
  );
  const typeTitle = document.querySelector(".products__catalog__filter__title");

  if (
    innerWidth <= 992 &&
    typeTitle.textContent.trim() === "Выберите животного"
  ) {
    filterBrandDisplay.style.display = "none";
  } else {
    filterBrandDisplay.style.display = "flex";
  }

  const filterBrandContainer = document.querySelector(
    ".products__catalog__filter__brand__list"
  );
  let brandMap = [];

  if (animalId) {
    getAllFilteredProducts(animalId).then((allProducts) => {
      console.log("Все товары категории загружены:", allProducts);

      const uniqueBrands = [];
      const seenBrandIds = [];

      if (allProducts && allProducts.length > 0) {
        for (const product of allProducts) {
          if (
            product.brand &&
            product.brand.id &&
            !seenBrandIds.includes(product.brand.id)
          ) {
            seenBrandIds.push(product.brand.id);
            uniqueBrands.push(product.brand);
          }
        }
      }

      console.log("Все уникальные бренды для категории:", uniqueBrands);
      brandMap = uniqueBrands;

      filterBrandContainer.innerHTML = "";

      for (const brandEl of brandMap) {
        const brandElement = document.createElement("div");
        brandElement.className = "products__catalog__filter__brand__item";
        brandElement.innerHTML = `
            <div class="products__catalog__filter__brand__indicator"></div>
            <p class="products__catalog__filter__brand__txt">${brandEl.name}</p>
          `;
        filterBrandContainer.appendChild(brandElement);
      }

      applyBrandFilters(brandMap, animalId, allProducts);
      searchBrandFilter();
    });
  } else {
    fetch("https://oliver1ck.pythonanywhere.com/api/get_brands_list/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("фильтры для брендов загружены:", data);
        brandMap = data.results;

        filterBrandContainer.innerHTML = "";

        for (const brandEl of brandMap) {
          const brandElement = document.createElement("div");
          brandElement.className = "products__catalog__filter__brand__item";
          brandElement.innerHTML = `
      <div class="products__catalog__filter__brand__indicator"></div>
      <p class="products__catalog__filter__brand__txt">${brandEl.name}</p>
      `;
          filterBrandContainer.appendChild(brandElement);
        }
        searchBrandFilter();
        applyBrandFilters(brandMap, animalId, []);
      })
      .catch((error) => {
        console.error("Ошибка fetch:", error);
      });
  }

  function applyBrandFilters(brandMap, animalId, allFilteredProducts) {
    const filterBrandElements = document.querySelectorAll(
      ".products__catalog__filter__brand__item"
    );

    for (const brandElement of filterBrandElements) {
      const indicator = brandElement.querySelector(
        ".products__catalog__filter__brand__indicator"
      );
      const brandText = brandElement.querySelector(
        ".products__catalog__filter__brand__txt"
      );
      const brandName = brandText.textContent.trim();

      const brandData = brandMap.find((item) => item.name === brandName);
      if (brandData && window.selectedBrands.includes(brandData.id)) {
        indicator.classList.add(
          "products__catalog__filter__brand__indicator__active"
        );
      } else {
        indicator.classList.remove(
          "products__catalog__filter__brand__indicator__active"
        );
      }
    }

    for (const filterBrandElement of filterBrandElements) {
      filterBrandElement.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (window.innerWidth <= 992) {
          const indicator = this.querySelector(
            ".products__catalog__filter__brand__indicator"
          );
          indicator.classList.toggle(
            "products__catalog__filter__brand__indicator__active"
          );

          return;
        }

        const indicator = this.querySelector(
          ".products__catalog__filter__brand__indicator"
        );
        indicator.classList.toggle(
          "products__catalog__filter__brand__indicator__active"
        );

        window.selectedBrands = [];
        const allActiveBrands = document.querySelectorAll(
          ".products__catalog__filter__brand__indicator__active"
        );

        for (const activeIndicator of allActiveBrands) {
          const brandItem = activeIndicator.closest(
            ".products__catalog__filter__brand__item"
          );
          const brandText = brandItem.querySelector(
            ".products__catalog__filter__brand__txt"
          );
          const brandName = brandText.textContent.trim();

          const brandData = brandMap.find((item) => item.name === brandName);
          if (brandData && brandData.id) {
            window.selectedBrands.push(brandData.id);
          }
        }

        let animalFilter = animalId ? `&animal__in=${animalId}` : "";

        if (!animalFilter && animalId) {
          animalFilter = `&animal__in=${animalId}`;
        }

        let categoryFilters = "";
        const activeCategoryIndicators = document.querySelectorAll(
          ".products__catalog__filter__type__indicator__active"
        );

        for (const categoryIndicator of activeCategoryIndicators) {
          const categoryItem = categoryIndicator.closest(
            ".products__catalog__filter__type__list__item, .food__category__item"
          );
          if (categoryItem) {
            const categoryText = categoryItem
              .querySelector(".products__catalog__filter__type__txt")
              .textContent.trim();

            const foundCategory = allFilteredProducts.find(
              (item) => item.category && item.category.name === categoryText
            );
            if (foundCategory && foundCategory.category) {
              categoryFilters += `&category__in=${foundCategory.category.id}`;
            }
          }
        }

        let subcategoryFilters = "";
        const activeSubcategoryIndicators = document.querySelectorAll(
          ".products__catalog__filter__subcategory__indicator__active"
        );

        for (const subcategoryIndicator of activeSubcategoryIndicators) {
          const subcategoryItem = subcategoryIndicator.closest(
            ".food__subcategory__item"
          );
          if (subcategoryItem) {
            const subcategoryText = subcategoryItem
              .querySelector(".products__catalog__filter__brand__txt")
              .textContent.trim();

            const foundSubcategory = allFilteredProducts.find(
              (item) => item.category && item.category.name === subcategoryText
            );
            if (foundSubcategory && foundSubcategory.category) {
              subcategoryFilters += `&category__in=${foundSubcategory.category.id}`;
            }
          }
        }

        let brandFilters = "";
        if (window.selectedBrands.length > 0) {
          for (const brandId of window.selectedBrands) {
            brandFilters += `&brand_id__in=${brandId}`;
          }
        }

        let finalFilterUrl;
        if (subcategoryFilters) {
          finalFilterUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
            window.currentOrder || "order=date_create"
          }${animalFilter}${subcategoryFilters}${brandFilters}&page=1`;
        } else if (categoryFilters) {
          finalFilterUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
            window.currentOrder || "order=date_create"
          }${animalFilter}${categoryFilters}${brandFilters}&page=1`;
        } else if (animalFilter) {
          finalFilterUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
            window.currentOrder || "order=date_create"
          }${animalFilter}${brandFilters}&page=1`;
        } else {
          finalFilterUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
            window.currentOrder || "order=date_create"
          }${brandFilters}&page=1`;
        }

        console.log("Final filter URL:", finalFilterUrl);

        const isPromotionalActive = document
          .querySelector(".promotional__item__indicator")
          ?.classList.contains("promotional__item__indicator__active");
        if (isPromotionalActive) {
          finalFilterUrl += "&sale__percent__gt=0";
        }

        fetch(finalFilterUrl)
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP status: ${response.status}`);
            return response.json();
          })
          .then((filteredData) => {
            if (typeof window.productItems === "function") {
              window.productItems(filteredData.results);
            }
            if (typeof window.updatePagination === "function") {
              window.updatePagination(
                filteredData,
                1,
                finalFilterUrl.replace("&page=1", "")
              );
            }
          })
          .catch((error) => {
            console.error("Ошибка загрузки отфильтрованных товаров:", error);
          });
      });
    }
  }

  function searchBrandFilter() {
    const searchBrandInput = document.querySelector(
      ".products__catalog__filter__brand__src__input"
    );
    const filterBrandContainer = document.querySelector(
      ".products__catalog__filter__brand__list"
    );
    const filterBrandItems = document.querySelectorAll(
      ".products__catalog__filter__brand__item"
    );

    searchBrandInput.addEventListener("input", function (e) {
      const searchText = e.target.value.toLowerCase().trim();
      let visibleItemsCount = 0;

      for (const itemBrand of filterBrandItems) {
        const brandText = itemBrand.querySelector(
          ".products__catalog__filter__brand__txt"
        );
        const brandName = brandText.textContent.toLowerCase();

        if (brandName.includes(searchText)) {
          itemBrand.style.display = "flex";
          visibleItemsCount++;
        } else {
          itemBrand.style.display = "none";
        }
      }

      const existingStub = filterBrandContainer.querySelector(".stub");
      if (existingStub) {
        existingStub.remove();
      }

      if (visibleItemsCount === 0 && searchText !== "") {
        const stub = document.createElement("div");
        stub.className = "stub";
        stub.innerHTML = `
        <img class="stub__img" src="./img/image 36.png" alt="stub">
        <h1 class="stub__title">По вашему запросу ничего не найдено. Попробуйте изменить запрос или выбрать бренд в нашем каталоге</h1>
        <a class="stub__link" href="catalog.html">Перейти в каталог</a>
      `;
        filterBrandContainer.appendChild(stub);
      }
    });
  }
};

window.addEventListener("resize", () => {
  promotionalFilter();
  filterBrandProducts();
});
