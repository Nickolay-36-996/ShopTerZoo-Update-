"use strict";
window.promotionalFilter = function () {
  const filterPromotional = document.querySelector(".promotional__item__lbl");

  filterPromotional.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const indicator = this.querySelector(".promotional__item__indicator");
    if (indicator) {
      indicator.classList.toggle("promotional__item__indicator__active");
    }
  });
};
