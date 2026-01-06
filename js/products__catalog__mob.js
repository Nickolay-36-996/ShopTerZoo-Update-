"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const burgerMobile = document.querySelector(".burger__menu__mobile");
  const burger = document.querySelector(".burger__menu");
  const sideBar = document.querySelector(
    ".products__catalog__products__filter"
  );

  function sideBarFilters() {
    const sideBarActivator = document.querySelector(
      ".products__catalog__fliter__mobile__wrap"
    );

    sideBarActivator.addEventListener("click", function () {
      sideBar.classList.add("products__catalog__products__filter__active");

      if (burgerMobile) {
        burgerMobile.classList.add("burger__active__mobile");
      }
      if (burger) {
        burger.classList.add("burger__active");
      }
    });
  }

  function handleBurgerClick() {
    const sideBar = document.querySelector(
      ".products__catalog__products__filter"
    );
    const burgerMobile = document.querySelector(".burger__menu__mobile");
    const burger = document.querySelector(".burger__menu");

    if (
      sideBar.classList.contains("products__catalog__products__filter__active")
    ) {
      sideBar.classList.remove("products__catalog__products__filter__active");

      if (burgerMobile) {
        burgerMobile.classList.remove("burger__active__mobile");
      }

      if (burger) {
        burger.classList.remove("burger__active");
      }
    }
  }

  if (burgerMobile) {
    burgerMobile.addEventListener("click", handleBurgerClick);
  }

  if (burger) {
    burger.addEventListener("click", handleBurgerClick);
  }

  window.applyFiltersForMobile = function () {
    const applyFiltersBtn = document.querySelector(".apply__filter__mobile");
    const typeTitle = document.querySelector(
      ".products__catalog__filter__title"
    );
    window.isApplyingFilters = false;

    if (!applyFiltersBtn) return;

    if (typeTitle && typeTitle.textContent.trim() === "Тип товара") {
      applyFiltersBtn.style.display = "block";
    } else {
      applyFiltersBtn.style.display = "none";
    }

    applyFiltersBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const productsData = JSON.parse(
        localStorage.getItem("catalogProducts") || "[]"
      );

      const categoryActive = document.querySelector(
        ".products__catalog__filter__type__indicator__active"
      );
      const subcategoryActive = document.querySelector(
        ".products__catalog__filter__subcategory__indicator__active"
      );
      const brandActive = document.querySelector(
        ".products__catalog__filter__brand__indicator__active"
      );
      const promotionalActive = document.querySelector(
        ".promotional__item__indicator__active"
      );

      let categoryId = "";

      if (categoryActive) {
        const categoryItem = categoryActive.closest(
          ".products__catalog__filter__type__list__item"
        );
        const categoryName = categoryItem
          .querySelector(".products__catalog__filter__type__txt")
          .textContent.trim();

        const foundProduct = productsData.find((item) => {
          return item.category.name === categoryName;
        });

        categoryId += `&category_id__in=${foundProduct.category.id}`;
      }

      let newUrl = `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create${categoryId}`;

      fetch(newUrl)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
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
              newUrl.replace("&page=1", "")
            );
          }
        })
        .catch((error) => {
          console.error("Ошибка загрузки отфильтрованных товаров:", error);
        });

      const sideBar = document.querySelector(
        ".products__catalog__products__filter"
      );

      if (sideBar) {
        sideBar.classList.remove("products__catalog__products__filter__active");
      }
    });
  };

  sideBarFilters();
});
