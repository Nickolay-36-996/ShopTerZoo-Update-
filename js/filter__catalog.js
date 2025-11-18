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

        const apiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}${brandFilter}&page=1`;

        fetch(apiUrl)
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
              window.updatePagination(data, 1, apiUrl.replace("&page=1", ""));
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

              const allCategoryIndicators = document.querySelectorAll(
                ".products__catalog__filter__type__indicator"
              );
              for (const categoryIndicator of allCategoryIndicators) {
                categoryIndicator.classList.remove(
                  "products__catalog__filter__type__indicator__active"
                );
              }

              const currentSubcategoryIndicator = subcategoryItem.querySelector(
                ".products__catalog__filter__brand__indicator"
              );

              if (currentSubcategoryIndicator) {
                currentSubcategoryIndicator.classList.toggle(
                  "products__catalog__filter__brand__indicator__active"
                );

                const parentCategory = subcategoryItem.closest(
                  ".food__category__item"
                );
                const parentIndicator = parentCategory.querySelector(
                  ".products__catalog__filter__type__indicator"
                );

                const activeSubcategoriesInParent =
                  parentCategory.querySelectorAll(
                    ".products__catalog__filter__brand__indicator__active"
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
                  ".products__catalog__filter__brand__indicator__active"
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

                const typeApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}${categoryFilters}${brandFilter}&page=1`;

                fetch(typeApiUrl)
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
                        typeApiUrl.replace("&page=1", "")
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
              <div class="products__catalog__filter__brand__indicator"></div>
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

                const otherParentIndicator = document.querySelectorAll(
                  ".products__catalog__filter__type__indicator"
                );
                for (const indicator of otherParentIndicator) {
                  indicator.classList.remove(
                    "products__catalog__filter__type__indicator__active"
                  );
                }

                const parentIndicator = this.querySelector(
                  ".products__catalog__filter__type__indicator"
                );
                parentIndicator.classList.toggle(
                  "products__catalog__filter__type__indicator__active"
                );

                const subcategoryIndicators = listItem.querySelectorAll(
                  ".products__catalog__filter__brand__indicator"
                );

                if (
                  parentIndicator.classList.contains(
                    "products__catalog__filter__type__indicator__active"
                  )
                ) {
                  for (const indicator of subcategoryIndicators) {
                    indicator.classList.add(
                      "products__catalog__filter__brand__indicator__active"
                    );
                  }
                } else {
                  for (const indicator of subcategoryIndicators) {
                    indicator.classList.remove(
                      "products__catalog__filter__brand__indicator__active"
                    );
                  }
                }

                const allActiveSubcategories = filterTypeList.querySelectorAll(
                  ".products__catalog__filter__brand__indicator__active"
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

                const typeApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}${categoryFilters}${brandFilter}&page=1`;

                fetch(typeApiUrl)
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
                        typeApiUrl.replace("&page=1", "")
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

                const allActiveSubcategoryIndicators =
                  document.querySelectorAll(
                    ".products__catalog__filter__brand__indicator__active"
                  );
                for (const indicator of allActiveSubcategoryIndicators) {
                  indicator.classList.remove(
                    "products__catalog__filter__brand__indicator__active"
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
                const currentIndicator = this.querySelector(
                  ".products__catalog__filter__type__indicator"
                );
                if (currentIndicator) {
                  currentIndicator.classList.add(
                    "products__catalog__filter__type__indicator__active"
                  );
                }

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

                  const typeApiUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&animal__in=${animalId}&category__in=${typeId}${brandFilter}&page=1`;

                  fetch(typeApiUrl)
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
                          typeApiUrl.replace("&page=1", "")
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
      }
    });
  }
};

window.filterBrandProducts = function (animalId = null) {
  const filterBrandContainer = document.querySelector(
    ".products__catalog__filter__brand__list"
  );
  let brandMap = [];

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

      // Создаем элементы брендов только если их еще нет
      if (filterBrandContainer.children.length === 0) {
        for (const brandEl of brandMap) {
          const brandElement = document.createElement("div");
          brandElement.className = "products__catalog__filter__brand__item";
          brandElement.setAttribute('data-brand-id', brandEl.id);
          brandElement.innerHTML = `
            <div class="products__catalog__filter__brand__indicator"></div>
            <p class="products__catalog__filter__brand__txt">${brandEl.name}</p>
          `;
          filterBrandContainer.appendChild(brandElement);
        }
      }

      // Если передан animalId, загружаем товары и скрываем недоступные бренды
      if (animalId) {
        getAllFilteredProducts(animalId).then((allProducts) => {
          window.hideBrandFilter(allProducts);
          applyBrandFilters(brandMap, animalId, allProducts);
        });
      } else {
        applyBrandFilters(brandMap, animalId, []);
      }
    })
    .catch((error) => {
      console.error("Ошибка fetch:", error);
    });

  function applyBrandFilters(brandMap, animalId, allFilteredProducts) {
    const filterBrandContainer = document.querySelector(
      ".products__catalog__filter__brand__list"
    );

    // УДАЛЯЕМ ВСЕ СТАРЫЕ ОБРАБОТЧИКИ и используем делегирование событий
    const newContainer = filterBrandContainer.cloneNode(true);
    filterBrandContainer.parentNode.replaceChild(newContainer, filterBrandContainer);

    // Восстанавливаем активное состояние
    const filterBrandElements = newContainer.querySelectorAll(
      ".products__catalog__filter__brand__item"
    );

    for (const brandElement of filterBrandElements) {
      if (brandElement.style.display === "none") continue;
      
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

    // ДОБАВЛЯЕМ ОДИН ОБРАБОТЧИК НА КОНТЕЙНЕР (делегирование событий)
    newContainer.addEventListener("click", function (e) {
      const brandElement = e.target.closest(".products__catalog__filter__brand__item");
      
      if (!brandElement || brandElement.style.display === "none") return;

      e.preventDefault();
      e.stopPropagation();

      const indicator = brandElement.querySelector(
        ".products__catalog__filter__brand__indicator"
      );
      const brandText = brandElement.querySelector(
        ".products__catalog__filter__brand__txt"
      );
      const brandName = brandText.textContent.trim();

      const brandData = brandMap.find((item) => item.name === brandName);
      if (!brandData) return;

      // Переключаем активный класс
      indicator.classList.toggle(
        "products__catalog__filter__brand__indicator__active"
      );

      // Обновляем выбранные бренды
      window.selectedBrands = [];
      const allActiveBrands = newContainer.querySelectorAll(
        ".products__catalog__filter__brand__indicator__active"
      );

      for (const activeIndicator of allActiveBrands) {
        const brandItem = activeIndicator.closest(
          ".products__catalog__filter__brand__item"
        );
        if (brandItem.style.display === "none") continue;
        
        const activeBrandText = brandItem.querySelector(
          ".products__catalog__filter__brand__txt"
        );
        const activeBrandName = activeBrandText.textContent.trim();

        const activeBrandData = brandMap.find((item) => item.name === activeBrandName);
        if (activeBrandData && activeBrandData.id) {
          window.selectedBrands.push(activeBrandData.id);
        }
      }

      // Применяем фильтры
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

      let brandFilters = "";
      if (window.selectedBrands.length > 0) {
        for (const brandId of window.selectedBrands) {
          brandFilters += `&brand_id__in=${brandId}`;
        }
      }

      let animalFilter = animalId ? `&animal__in=${animalId}` : "";

      const filterUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create${animalFilter}${categoryFilters}${brandFilters}&page=1`;

      fetch(filterUrl)
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
              filterUrl.replace("&page=1", "")
            );
          }
        })
        .catch((error) => {
          console.error("Ошибка загрузки отфильтрованных товаров:", error);
        });
    });
  }
};
