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

    const isActive = indicator.classList.contains(
      "promotional__item__indicator__active"
    );

    let url =
      "https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create";

    if (isActive) {
      url += "&sale__percent__gt=0";
    }

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
          window.updatePagination(data, 1, url.replace("&page=1", ""));
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки товаров по акции:", error);
      });
  });
};
