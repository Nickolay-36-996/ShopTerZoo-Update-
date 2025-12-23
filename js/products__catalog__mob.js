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
    const isMobile = window.innerWidth <= 992;

    if (!applyFiltersBtn) return;

    if (typeTitle && typeTitle.textContent.trim() === "Тип товара") {
      applyFiltersBtn.style.display = "block";
    } else {
      applyFiltersBtn.style.display = "none";
    }

    if (isMobile && applyFiltersBtn.style.display === "block") {
      const typeFilters = document.querySelectorAll('.products__catalog__filter__type__list__item');
    }
  };

  sideBarFilters();
});
