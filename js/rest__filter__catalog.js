"use strict";
window.promotionalFilter = function () {
  const filterPromotional = document.querySelector(".promotional__item__lbl");

  filterPromotional.addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const indicator = this.querySelector(".promotional__item__indicator");
    if (indicator) {
      indicator.classList.toggle("promotional__item__indicator__active");
    }

    const isActive = indicator.classList.contains(
      "promotional__item__indicator__active"
    );

    let animalId = "";
    const activeAnimalIndicator = document.querySelector(
      ".products__catalog__filter__type__indicator__active"
    );
    if (activeAnimalIndicator) {
      const animalItem = activeAnimalIndicator.closest(
        ".products__catalog__filter__type__list__item"
      );
      if (animalItem) {
        const animalText = animalItem
          .querySelector(".products__catalog__filter__type__txt")
          .textContent.trim()
          .toLowerCase();
        const animalFilterMap = {
          собаки: "1",
          кошки: "2",
          грызуны: "3",
          птицы: "4",
          рыбки: "5",
        };
        animalId = animalFilterMap[animalText];
      }
    }

    let categoryFilters = "";
    const activeSubcategoryIndicators = document.querySelectorAll(
      ".products__catalog__filter__subcategory__indicator__active"
    );
    const activeCategoryIndicators = document.querySelectorAll(
      ".products__catalog__filter__type__indicator__active"
    );

    if (activeSubcategoryIndicators.length > 0) {
      const categoryIds = [];
      for (const subcategoryIndicator of activeSubcategoryIndicators) {
        const subcategoryItem = subcategoryIndicator.closest(
          ".food__subcategory__item"
        );
        if (subcategoryItem) {
          const subcategoryText = subcategoryItem
            .querySelector(".products__catalog__filter__brand__txt")
            .textContent.trim();

          if (animalId) {
            const allProducts = await window.getAllFilteredProducts(animalId);
            const foundCategory = allProducts.find(
              (item) => item.category && item.category.name === subcategoryText
            );
            if (
              foundCategory &&
              foundCategory.category &&
              !categoryIds.includes(foundCategory.category.id)
            ) {
              categoryIds.push(foundCategory.category.id);
            }
          }
        }
      }
      if (categoryIds.length > 0) {
        categoryFilters = `&category__in=${categoryIds.join(",")}`;
      }
    } else if (activeCategoryIndicators.length > 0) {
      const categoryIds = [];
      for (const categoryIndicator of activeCategoryIndicators) {
        const categoryItem = categoryIndicator.closest(
          ".products__catalog__filter__type__list__item"
        );
        if (categoryItem) {
          const categoryText = categoryItem
            .querySelector(".products__catalog__filter__type__txt")
            .textContent.trim();

          if (animalId) {
            const allProducts = await window.getAllFilteredProducts(animalId);
            const foundCategory = allProducts.find(
              (item) => item.category && item.category.name === categoryText
            );
            if (
              foundCategory &&
              foundCategory.category &&
              !categoryIds.includes(foundCategory.category.id)
            ) {
              categoryIds.push(foundCategory.category.id);
            }
          }
        }
      }
      if (categoryIds.length > 0) {
        categoryFilters = `&category__in=${categoryIds.join(",")}`;
      }
    }

    let brandFilters = "";
    if (window.selectedBrands && window.selectedBrands.length > 0) {
      brandFilters = `&brand_id__in=${window.selectedBrands.join(",")}`;
    }

    let url = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?${
      window.currentOrder || "order=date_create"
    }`;

    if (isActive) {
      url += "&sale__percent__gt=0";
    }

    if (animalId) {
      url += `&animal__in=${animalId}`;
    }

    url += categoryFilters + brandFilters;

    console.log("Promotional filter URL:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (typeof window.productItems === "function") {
          window.productItems(data.results);
        }
        if (typeof window.updatePagination === "function") {
          window.updatePagination(data, 1, url + "&page=1");
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки товаров по акции:", error);
      });
  });
};

window.orderFilter = function (allProducts) {
  const select = document.querySelector(".products__catalog__sort__select");
  const selectList = document.querySelector(
    ".products__catalog__sort__select__list"
  );
  const selectFilter = document.querySelectorAll(
    ".products__catalog__sort__select__list__item"
  );
  const selectFilterActive = document.querySelector(
    ".products__catalog__sort__select__active"
  );

  window.currentOrder = "order=date_create";

  const selectMap = {
    "дате добавления": "order=date_create",
    "названию: «от А до Я»": "order=title",
    "названию: «от Я до А»": "order=-title",
    "цене по возр.": "order=price",
    "цене по убыв.": "order=-price",
    популярности: "order=-sales_counter",
  };

  select.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    selectList.classList.toggle(
      "products__catalog__sort__select__list__active"
    );

    if (selectFilter) {
      for (const order of selectFilter) {
        order.addEventListener("click", async function (e) {
          e.preventDefault();
          e.stopPropagation();

          selectList.classList.remove(
            "products__catalog__sort__select__list__active"
          );

          const selectedElement = this.querySelector(
            ".products__catalog__sort__select__list__item__txt"
          );
          const selectedOrder = selectedElement.textContent.trim();

          selectFilterActive.textContent = selectedOrder;

          const orderValue = selectMap[selectedOrder];
          window.currentOrder = orderValue;

          const activeAnimalItem = document.querySelector(
            ".animal__category__catalog__active"
          );

          const activeAnimalIndicator = document.querySelector(
            ".products__catalog__filter__type__indicator__active"
          );

          const allActiveIndicators = document.querySelectorAll(
            ".products__catalog__filter__type__indicator__active"
          );

          let animalFilter = "";
          let animalId = null;

          if (activeAnimalItem) {
            const animalText = activeAnimalItem
              .querySelector(".animal__category__catalog__title")
              .textContent.trim()
              .toLowerCase();

            const animalFilterMap = {
              собаки: "1",
              кошки: "2",
              грызуны: "3",
              птицы: "4",
              рыбки: "5",
            };

            animalId = animalFilterMap[animalText];
            if (animalId) {
              animalFilter = `&animal__in=${animalId}`;
            }
          } else if (activeAnimalIndicator) {
            const animalItem = activeAnimalIndicator.closest(
              ".products__catalog__filter__type__list__item"
            );
            if (animalItem) {
              const animalText = animalItem
                .querySelector(".products__catalog__filter__type__txt")
                .textContent.trim()
                .toLowerCase();

              const animalFilterMap = {
                собаки: "1",
                кошки: "2",
                грызуны: "3",
                птицы: "4",
                рыбки: "5",
              };

              animalId = animalFilterMap[animalText];
              if (animalId) {
                animalFilter = `&animal__in=${animalId}`;
              }
            }
          }

          if (animalId) {
            animalFilter = `&animal__in=${animalId}`;

            const allCategoryProducts = await window.getAllFilteredProducts(
              animalId
            );

            let categoryFilter = "";

            const activeSubcategoryIndicators = document.querySelectorAll(
              ".products__catalog__filter__subcategory__indicator__active"
            );

            const categoryIds = [];

            if (activeSubcategoryIndicators.length > 0) {
              for (const subcategoryIndicator of activeSubcategoryIndicators) {
                const subcategoryItem = subcategoryIndicator.closest(
                  ".food__subcategory__item"
                );

                if (subcategoryItem) {
                  const subcategoryText = subcategoryItem
                    .querySelector(".products__catalog__filter__brand__txt")
                    .textContent.trim();

                  const foundProduct = allCategoryProducts.find(
                    (item) =>
                      item.category && item.category.name === subcategoryText
                  );

                  if (foundProduct && foundProduct.category) {
                    if (!categoryIds.includes(foundProduct.category.id)) {
                      categoryIds.push(foundProduct.category.id);
                    }
                  }
                }
              }
            }

            if (categoryIds.length === 0) {
              const activeCategoryIndicators = document.querySelectorAll(
                ".products__catalog__filter__type__indicator__active"
              );

              if (activeCategoryIndicators.length > 0) {
                for (const categoryIndicator of activeCategoryIndicators) {
                  const categoryItem = categoryIndicator.closest(
                    ".products__catalog__filter__type__list__item, .food__category__item"
                  );

                  if (categoryItem) {
                    const categoryText = categoryItem
                      .querySelector(".products__catalog__filter__type__txt")
                      .textContent.trim();

                    const foundProduct = allCategoryProducts.find(
                      (item) =>
                        item.category && item.category.name === categoryText
                    );
                    if (
                      foundProduct &&
                      foundProduct.category &&
                      !categoryIds.includes(foundProduct.category.id)
                    ) {
                      categoryIds.push(foundProduct.category.id);
                    }
                  }
                }
              }
            }

            if (categoryIds.length > 0) {
              categoryFilter = categoryIds
                .map((id) => `&category_id__in=${id}`)
                .join("");
            }

            let brandFilter = "";
            if (window.selectedBrands && window.selectedBrands.length > 0) {
              brandFilter = window.selectedBrands
                .map((id) => `&brand_id__in=${id}`)
                .join("");
            }

            let saleFilter = "";
            const promotionalIndicator = document.querySelector(
              ".promotional__item__indicator"
            );
            if (
              promotionalIndicator &&
              promotionalIndicator.classList.contains(
                "promotional__item__indicator__active"
              )
            ) {
              saleFilter = "&sale__percent__gt=0";
            }

            const baseUrl =
              "https://oliver1ck.pythonanywhere.com/api/get_products_filter/";
            let finalUrl = `${baseUrl}?${window.currentOrder}${animalFilter}${categoryFilter}${brandFilter}${saleFilter}&page=1`;

            fetch(finalUrl)
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
                    finalUrl.replace("&page=1", "")
                  );
                }
              })
              .catch((error) => {
                console.error(
                  "Ошибка загрузки отфильтрованных товаров:",
                  error
                );
              });
          } else {
            let brandFilter = "";
            if (window.selectedBrands && window.selectedBrands.length > 0) {
              brandFilter = window.selectedBrands
                .map((id) => `&brand_id__in=${id}`)
                .join("");
            }

            let saleFilter = "";
            const promotionalIndicator = document.querySelector(
              ".promotional__item__indicator"
            );
            if (
              promotionalIndicator &&
              promotionalIndicator.classList.contains(
                "promotional__item__indicator__active"
              )
            ) {
              saleFilter = "&sale__percent__gt=0";
            }

            const baseUrl =
              "https://oliver1ck.pythonanywhere.com/api/get_products_filter/";
            let finalUrl = `${baseUrl}?${window.currentOrder}${brandFilter}${saleFilter}&page=1`;

            fetch(finalUrl)
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
                    finalUrl.replace("&page=1", "")
                  );
                }
              })
              .catch((error) => {
                console.error("Ошибка загрузки товаров:", error);
              });
          }
        });
      }
    }
  });
};
