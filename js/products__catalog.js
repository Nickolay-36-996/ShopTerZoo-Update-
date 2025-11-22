"use strict";
document.addEventListener("DOMContentLoaded", () => {
  let allProducts = [];

  fetch(
    "https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create"
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("page count:", data);
      if (data.results && data.results.length > 0) {
        allProducts = data.results;
      }
      pagesCount(data);
      productItems(allProducts);
      window.filterCategoryAnimal(allProducts);
      autoApplyFilter();
      window.filterBrandProducts();
    })
    .catch((error) => {
      console.error("Ошибка fetch:", error);
    });

  function autoApplyFilter() {
    const savedCategory = localStorage.getItem("autoFilterCategory");

    if (savedCategory) {
      const filterItems = document.querySelectorAll(
        ".products__catalog__filter__type__list__item"
      );

      for (let item of filterItems) {
        const itemText = item
          .querySelector(".products__catalog__filter__type__txt")
          .textContent.toLowerCase();
        if (itemText === savedCategory) {
          item.click();
          localStorage.removeItem("autoFilterCategory");
          break;
        }
      }
    }
  }

  function pagesCount(data) {
    const paginationContainer = document.querySelector(
      ".products__catalog__products__list__slider__pangination"
    );

    paginationContainer.innerHTML = "";
    const totalItems = data.count;
    const itemsPerPage = data.results.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    let currentPage = 1;

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.className =
        "products__catalog__products__list__slider__pangination__item";
      pageItem.textContent = i;

      pageItem.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        currentPage = i;

        const allPageItems = paginationContainer.querySelectorAll(
          ".products__catalog__products__list__slider__pangination__item"
        );

        for (const pageUnaktive of allPageItems) {
          pageUnaktive.classList.remove(
            "products__catalog__products__list__slider__pangination__item__active"
          );
        }

        this.classList.add(
          "products__catalog__products__list__slider__pangination__item__active"
        );

        fetch(
          `https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create&page=${i}`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("сртаница загружена:", allProducts);
            allProducts = data.results;
            productItems(allProducts);
          })
          .catch((error) => {
            console.error("Ошибка загрузки страницы:", error);
          });
      });

      paginationContainer.appendChild(pageItem);

      const firstPageItem = paginationContainer.querySelector(
        ".products__catalog__products__list__slider__pangination__item"
      );
      if (firstPageItem) {
        firstPageItem.classList.add(
          "products__catalog__products__list__slider__pangination__item__active"
        );
      }
    }

    function switching() {
      const buttonPrew = document.getElementById("page-prew");
      const buttonNext = document.getElementById("page-next");

      buttonNext.addEventListener("click", function () {
        if (currentPage < totalPages) {
          currentPage++;

          const allPageItems = paginationContainer.querySelectorAll(
            ".products__catalog__products__list__slider__pangination__item"
          );

          const nextPageItem = allPageItems[currentPage - 1];

          if (nextPageItem) {
            nextPageItem.click();
          }
        }
      });

      buttonPrew.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage--;

          const allPageItems = paginationContainer.querySelectorAll(
            ".products__catalog__products__list__slider__pangination__item"
          );

          const prevPageItem = allPageItems[currentPage - 1];

          if (prevPageItem) {
            prevPageItem.click();
          }
        }
      });
    }
    switching();
  }

  window.updatePagination = function (data, currentPage, filterUrl) {
    const paginationContainer = document.querySelector(
      ".products__catalog__products__list__slider__pangination"
    );

    paginationContainer.innerHTML = "";
    const totalItems = data.count;
    const itemsPerPage = 15;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    let currentPageNum = currentPage;

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.className =
        "products__catalog__products__list__slider__pangination__item";
      pageItem.textContent = i;

      if (i === currentPageNum) {
        pageItem.classList.add(
          "products__catalog__products__list__slider__pangination__item__active"
        );
      }

      pageItem.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        currentPageNum = i;

        const pageUrl = `${filterUrl}&page=${i}`;

        fetch(pageUrl)
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

            const allPageItems = paginationContainer.querySelectorAll(
              ".products__catalog__products__list__slider__pangination__item"
            );
            for (const pageItem of allPageItems) {
              pageItem.classList.remove(
                "products__catalog__products__list__slider__pangination__item__active"
              );
            }
            this.classList.add(
              "products__catalog__products__list__slider__pangination__item__active"
            );
          })
          .catch((error) => {
            console.error("Ошибка загрузки страницы:", error);
          });
      });

      paginationContainer.appendChild(pageItem);
    }

    const buttonPrev = document.getElementById("page-prew");
    const buttonNext = document.getElementById("page-next");

    buttonPrev.onclick = function () {
      if (currentPageNum > 1) {
        document
          .querySelectorAll(
            ".products__catalog__products__list__slider__pangination__item"
          )
          [currentPageNum - 2].click();
      }
    };

    buttonNext.onclick = function () {
      if (currentPageNum < totalPages) {
        document
          .querySelectorAll(
            ".products__catalog__products__list__slider__pangination__item"
          )
          [currentPageNum].click();
      }
    };
  };

  window.productItems = function (allProducts) {
    const productsContainer = document.getElementById("products-list");
    const background = document.querySelector(
      ".products__catalog__products__list__wrap"
    );

    productsContainer.innerHTML = "";

    const paginationControl = document.querySelector(
      ".products__catalog__products__list__slider"
    );

    const existingStub = background.querySelector(".stub__catalog");
    if (existingStub) {
      existingStub.remove();
    }

    if (allProducts.length === 0) {
      const stubCatalog = document.createElement("div");
      stubCatalog.className = "stub__catalog";
      stubCatalog.style.display = "flex";
      stubCatalog.innerHTML = `
      <img class="stub__catalog__img" src="./img/image 38.png" alt="stub-catalog"></img>
      <h1 class="stub__catalog__title">По вашему запросу ничего не найдено. сбросьте фильтр и попробуйте снова</h1>
      <button class="stub__catalog__reset__filters">Сбросить фильтры</button>
      `;

      background.appendChild(stubCatalog);
      paginationControl.style.display = "none";

      const resetAllFilters = stubCatalog.querySelector(
        ".stub__catalog__reset__filters"
      );
      resetAllFilters.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        window.selectedBrands = [];

        const allAnimalItems = document.querySelectorAll(
          ".animal__category__catalog"
        );
        for (const item of allAnimalItems) {
          item.classList.remove("animal__category__catalog__active");
        }

        const allAnimalIndicators = document.querySelectorAll(
          ".products__catalog__filter__type__indicator"
        );
        for (const indicator of allAnimalIndicators) {
          indicator.classList.remove(
            "products__catalog__filter__type__indicator__active"
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

        const allBrandIndicators = document.querySelectorAll(
          ".products__catalog__filter__brand__indicator"
        );
        for (const indicator of allBrandIndicators) {
          indicator.classList.remove(
            "products__catalog__filter__brand__indicator__active"
          );
        }

        const filterContainer = document.querySelector(
          ".products__catalog__filter__type"
        );
        const typeTitle = document.querySelector(
          ".products__catalog__filter__title"
        );

        const oldFilterTypeList = document.querySelector(".filter__type__list");
        if (oldFilterTypeList) {
          oldFilterTypeList.remove();
        }

        const filterAnimalList = document.querySelector(
          ".products__catalog__filter__type__list"
        );
        if (filterAnimalList) {
          filterAnimalList.style.display = "flex";
        }

        if (typeTitle) {
          typeTitle.textContent = "Выберите животного";
        }

        const catalogTitle = document.querySelector(
          ".products__catalog__title"
        );
        if (catalogTitle) {
          catalogTitle.textContent = "Каталог товаров";
        }

        fetch(
          "https://oliver1ck.pythonanywhere.com/api/get_products_filter/?order=date_create"
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("page count:", data);
            if (data.results && data.results.length > 0) {
              allProducts = data.results;
            }
            pagesCount(data);
            productItems(allProducts);
            window.filterCategoryAnimal(allProducts);
            autoApplyFilter();
            window.filterBrandProducts();
          })
          .catch((error) => {
            console.error("Ошибка fetch:", error);
          });
      });
    } else {
      paginationControl.style.display = "flex";
    }

    for (const product of allProducts) {
      const basePrice = parseFloat(product.price) || 0;
      const discountPercent = product.sale?.percent || 0;
      const discountedPrice = basePrice * (1 - discountPercent / 100);
      let quantityOptions = "";

      if (
        product.countitemproduct_set &&
        product.countitemproduct_set.length > 0
      ) {
        quantityOptions = product.countitemproduct_set
          .map((item) => {
            return `<span class="popular__products__card__quantity" 
                     data-count="${item.value}">
                     ${item.value} ${item.unit}
                   </span>`;
          })
          .join("");
      }

      const productItem = document.createElement("article");
      productItem.className = "products__catalog__products__card";
      productItem.innerHTML = `
        <div class="products__catalog__products__card__info">
        ${
          discountPercent > 0
            ? `
          <div class="popular__product__sale__badge">Акция</div>
          `
            : ""
        }
          <a href="product__page.html?id=${
            product.id
          }" class="products__catalog__products__card__photo__link">
            <img class="products__catalog__products__card__photo__img" src="${
              product.image_prev
            }" alt="${product.title}" />
          </a>
          <a href="product__page.html?id=${
            product.id
          }" class="products__catalog__products__card__title__link">${
        product.title
      }</a>
        </div>
        <div class="products__catalog__products__card__quantity__container">
          <div class="products__catalog__products__card__quantity__box">
           ${
             quantityOptions ||
             '<span class="popular__products__card__quantity">1 шт.</span>'
           }
          </div>
        </div>
        <div class="products__catalog__products__card__pay">
          <div class="products__catalog__products__card__pay__price">
          ${
            discountPercent > 0
              ? `
                <div class="popular__products__card__pay__price__box">
              <p class="popular__products__card__pay__price__old">${basePrice.toFixed(
                2
              )} BYN</p>
              <p class="popular__products__card__pay__price__p">${discountedPrice.toFixed(
                2
              )} BYN</p>
              </div>
            `
              : `
              <p class="popular__products__card__pay__price__p">${basePrice.toFixed(
                2
              )} BYN</p>
            `
          }
            <button class="products__catalog__products__card__basked__add" data-product-id="${
              product.id
            }">
              <div class="products__catalog__products__card__basked__img__box">
                <svg class="products__catalog__products__card__basked__img__box" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M1 1C1 0.447715 1.44932 0 2.00358 0H3.50894C4.34034 0 5.01431 0.671572 5.01431 1.5V2.06055L17.5883 2.96818C18.4651 3.02278 19.1089 3.81081 18.9846 4.67739L18.1194 10.7121C18.0135 11.4511 17.3783 12 16.6292 12H5.01431V14H15.0572C16.72 14 18.068 15.3431 18.068 17C18.068 18.6569 16.72 20 15.0572 20C13.3945 20 12.0465 18.6569 12.0465 17C12.0465 16.6494 12.1069 16.3128 12.2178 16H6.85015C6.9611 16.3128 7.02147 16.6494 7.02147 17C7.02147 18.6569 5.67352 20 4.01073 20C2.34795 20 1 18.6569 1 17C1 15.6938 1.83779 14.5825 3.00716 14.1707V3.00923C3.00711 3.00372 3.00711 2.99821 3.00716 2.99268V2H2.00358C1.44932 2 1 1.55228 1 1ZM5.01431 4.06445V10H16.194L16.9208 4.93051L5.01431 4.06445ZM14.0537 17C14.0537 16.4477 14.503 16 15.0572 16C15.6115 16 16.0608 16.4477 16.0608 17C16.0608 17.5523 15.6115 18 15.0572 18C14.503 18 14.0537 17.5523 14.0537 17ZM3.00716 17C3.00716 16.4477 3.45647 16 4.01073 16C4.56499 16 5.01431 16.4477 5.01431 17C5.01431 17.5523 4.56499 18 4.01073 18C3.45647 18 3.00716 17.5523 3.00716 17Z" fill="#5C5F62"/>
                </svg>
                <div class="products__catalog__products__card__basket__img">
                  <svg class="products__catalog__products__card__plus__img" width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.871582 5.46973H4.10889V8.72168H5.55908V5.46973H8.80371V4.01221H5.55908V0.760254H4.10889V4.01221H0.871582V5.46973Z" fill="#5C5F62"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>
          <button class="products__catalog__products__card__pay__btn">Купить в 1 клик</button>
        </div>
        `;

      productsContainer.appendChild(productItem);

      priceCalculation();
      addToBasket(product);
      buyClick(product);

      function priceCalculation() {
        const quantityOptions = productItem.querySelectorAll(
          ".popular__products__card__quantity"
        );
        const currentPrice = productItem.querySelector(
          ".popular__products__card__pay__price__p"
        );
        const currentOldPrice = productItem.querySelector(
          ".popular__products__card__pay__price__old"
        );

        for (const option of quantityOptions) {
          option.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const optionText = this.textContent.trim();
            const quantityActive = parseFloat(optionText) || 1;

            const isActive = this.classList.contains(
              "products__catalog__products__card__quantity__active"
            );

            if (isActive) {
              for (const opt of quantityOptions) {
                opt.classList.remove(
                  "products__catalog__products__card__quantity__active"
                );
              }
              if (discountPercent > 0) {
                currentPrice.textContent = discountedPrice.toFixed(2) + " BYN";
                if (currentOldPrice) {
                  currentOldPrice.textContent = basePrice.toFixed(2) + " BYN";
                }
              } else {
                currentPrice.textContent = basePrice.toFixed(2) + " BYN";
              }
            } else {
              for (const opt of quantityOptions) {
                opt.classList.remove(
                  "products__catalog__products__card__quantity__active"
                );
              }
              this.classList.add(
                "products__catalog__products__card__quantity__active"
              );

              if (discountPercent > 0) {
                const newPrice = discountedPrice * quantityActive;
                const newOldPrice = basePrice * quantityActive;
                currentPrice.textContent = newPrice.toFixed(2) + " BYN";
                if (currentOldPrice) {
                  currentOldPrice.textContent = newOldPrice.toFixed(2) + " BYN";
                }
              } else {
                const newPrice = basePrice * quantityActive;
                currentPrice.textContent = newPrice.toFixed(2) + " BYN";
              }
            }
          });
        }
      }

      function addToBasket(product) {
        const addToCartBtn = productItem.querySelector(
          ".products__catalog__products__card__basked__add"
        );

        addToCartBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          const card = this.closest(".products__catalog__products__card");
          const productId = this.getAttribute("data-product-id");

          const priceElement = card.querySelector(
            ".popular__products__card__pay__price__p"
          );
          const oldPriceElement = card.querySelector(
            ".popular__products__card__pay__price__old"
          );
          const activeQuantity = card.querySelector(
            ".products__catalog__products__card__quantity__active"
          );

          const saleBadge = card.querySelector(
            ".popular__product__sale__badge"
          );

          let price = 0;
          let oldPrice = 0;
          let packaging = "1 шт.";
          let hasPromotion = false;

          if (saleBadge) {
            hasPromotion = true;
          }

          if (activeQuantity) {
            packaging = activeQuantity.textContent.trim();
          }

          if (priceElement) {
            const priceText = priceElement.textContent;
            price = parseFloat(priceText.replace(" BYN", "").trim());
          }

          if (oldPriceElement) {
            const oldPriceText = oldPriceElement.textContent;
            oldPrice = parseFloat(oldPriceText.replace(" BYN", "").trim());
          } else {
            oldPrice = price;
          }

          const cardData = {
            productId: parseInt(productId),
            price: price,
            oldPrice: oldPrice,
            packaging: packaging,
            hasPromotion: hasPromotion,
            title: product.title,
            image: product.image_prev,
          };

          let basketItems =
            JSON.parse(localStorage.getItem("basketItem")) || [];
          basketItems.push(cardData);
          localStorage.setItem("basketItem", JSON.stringify(basketItems));

          console.log("Товар добавлен в корзину! ID:", productId);

          if (typeof updateBasketDisplay === "function") {
            updateBasketDisplay();
          }

          updateBasketCounter();
        });
      }

      function buyClick(product) {
        const buyItems = productItem.querySelectorAll(
          ".products__catalog__products__card__pay__btn"
        );

        const overlay = document.createElement("div");
        overlay.className = "modal__overlay";

        const buyModal = document.createElement("div");
        buyModal.className = "buy__modal";

        document.body.appendChild(buyModal);
        document.body.appendChild(overlay);

        for (const buyItem of buyItems) {
          buyItem.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();

            overlay.style.display = "block";
            buyModal.style.display = "block";

            const card = this.closest(".products__catalog__products__card");

            const quantityActiveOption = card.querySelector(
              ".products__catalog__products__card__quantity__active"
            );

            let activeOptionCount = 1;
            if (quantityActiveOption) {
              const quantityActiveText =
                quantityActiveOption.textContent.trim();
              activeOptionCount = parseFloat(quantityActiveText) || 1;
            }

            let quantityOptions = "";

            if (
              product.countitemproduct_set &&
              product.countitemproduct_set.length > 0
            ) {
              quantityOptions = product.countitemproduct_set
                .map((item) => {
                  const isActive =
                    item.value === activeOptionCount
                      ? "popular__products__card__quantity__active"
                      : "";
                  return `<span class="popular__products__card__quantity ${isActive}" 
                     data-count="${item.value}">
                     ${item.value} ${item.unit}
                   </span>`;
                })
                .join("");
            }

            const hasWeightOptions =
              product.countitemproduct_set &&
              product.countitemproduct_set.some((item) =>
                item.unit.includes("кг")
              );

            const basePrice = parseFloat(product.price) || 0;
            const discountPercent = product.sale?.percent || 0;
            const discountedPrice = basePrice * (1 - discountPercent / 100);

            let count = 1;

            buyModal.innerHTML = `
         <div class="buy__modal__wrap">
         ${
           discountPercent > 0
             ? `
          <div class="popular__product__sale__badge buy__modal__badge">Акция</div>
          `
             : ""
         }
         <span class="buy__modal__close">
         <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z" fill="#5C5F62"/>
         </svg>
         </span>
         <h2 class="buy__modal__title">Оформление заказа в 1 клик</h2>
         <div class="buy__modal__card">
         <div>
         <img src="${product.image_prev}" alt="${
              product.title
            }" class="buy__modal__card__img">
         </div>
         <div class="buy__modal__card__description">
         <h3 class="buy__modal__card__title">${product.title}</h3>
         <div class="buy__modal__card__options">${
           quantityOptions ||
           '<span class="popular__products__card__quantity popular__products__card__quantity__active">1 шт.</span>'
         }</div>
         <div class="buy__modal__card__set__weight__wrap">${
           hasWeightOptions
             ? `
         <div class="buy__modal__card__set__weight">
         <button class="buy__modal__card__btn">Указать свой вес</button>
         <div class="buy__modal__card__set__weight__box">
         <h3 class="buy__modal__card__set__weight__title">Задайте свой вес</h3>
         <div class="buy__modal__card__set__weight__hide">
         <input class="product__page__modal__set__weight__value" placeholder="Например: 1,2 кг" maxlength="4">
         <button class="product__page__modal__set__weight__btn">Применить</button>
         </div>
         </div>
         </div>
          `
             : ""
         }</div>
         </div>
         <div class="buy__modal__card__price__wrap">
         <div class="product__page__pay__add">
         <button class="product__page__pay__operator modal__operator__take__away" id="take-away-modal">
         <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
         <g clip-path="url(#clip0_933_8222)">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M15 9H5C4.447 9 4 9.448 4 10C4 10.552 4.447 11 5 11H15C15.553 11 16 10.552 16 10C16 9.448 15.553 9 15 9Z" fill="#008060"/>
         </g>
         <defs>
         <clipPath id="clip0_933_8222">
         <rect width="20" height="20" fill="white"/>
         </clipPath>
         </defs>
         </svg>
         </button>
         <div class="product__page__pay__counter modal__counter">${count}</div>
         <button class="product__page__pay__operator modal__operator__add" id="total-add-modal">
         <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
         <g clip-path="url(#clip0_933_8230)">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M17 9H11V3C11 2.448 10.553 2 10 2C9.447 2 9 2.448 9 3V9H3C2.447 9 2 9.448 2 10C2 10.552 2.447 11 3 11H9V17C9 17.552 9.447 18 10 18C10.553 18 11 17.552 11 17V11H17C17.553 11 18 10.552 18 10C18 9.448 17.553 9 17 9Z" fill="#008060"/>
         </g>
         <defs>
         <clipPath id="clip0_933_8230">
         <rect width="20" height="20" fill="white"/>
         </clipPath>
         </defs>
         </svg>
         </button>
         </div>
         <div class="buy__modal__card__price__box">
         ${
           discountPercent > 0
             ? `
         <span class="buy__modal__card__old__price">${(
           basePrice * activeOptionCount
         ).toFixed(0)} BYN</span>
         <span class="buy__modal__card__price">${(
           discountedPrice * activeOptionCount
         ).toFixed(0)} BYN</span>
          `
             : `
        <span class="buy__modal__card__price">${(
          basePrice * activeOptionCount
        ).toFixed(0)} BYN</span>
          `
         }
         </div>
         </div>
         </div>
         <p class="buy__modal__card__p">Заполните данные и нажмите кнопку «Оформить заказ». Товар будет ждать вас по адресу: Минск, ул. Чюрлёниса, 6.</p>
         <form class="order__input__box input__box__buy__click">
              <div class="order__input__wrap">
                <h3 class="order__input__title">Имя</h3>
                <input
                  type="text"
                  id="buy-name"
                  name="name"
                  maxlength="25"
                  pattern="[А-Яа-яЁё\s]+"
                  class="order__input"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
              <div class="order__input__wrap">
                <h3 class="order__input__title">Номер телефона</h3>
                <input
                  type="tel"
                  id="buy-phone"
                  name="phone"
                  maxlength="13"
                  pattern="\+375[0-9]{9}"
                  placeholder="+375"
                  class="order__input"
                  required
                />
              </div>
            </form>
            <button class="buy__modal__card__form__btn">Оформить заказ</button>
            <p class="buy__modal__card__privaty">Нажимая на кнопку вы даёте согласие на обработку <a href="#" class="buy__modal__card__privaty__link">персональных данных</a></p>
         </div>
         `;

            function setOptionsBuyClick() {
              const quantityOptions = buyModal.querySelectorAll(
                ".popular__products__card__quantity"
              );

              const priceElement = buyModal.querySelector(
                ".buy__modal__card__price"
              );
              const oldPriceElement = buyModal.querySelector(
                ".buy__modal__card__old__price"
              );
              const counter = buyModal.querySelector(
                ".product__page__pay__counter"
              );

              let newPrice = 0;
              let newOldPrice = 0;

              const activeOption = buyModal.querySelector(
                ".popular__products__card__quantity__active"
              );

              if (activeOption) {
                const optionText = activeOption.textContent.trim();
                const optionQuantity = parseFloat(optionText);

                if (discountPercent > 0) {
                  newPrice = discountedPrice * optionQuantity;
                  newOldPrice = basePrice * optionQuantity;

                  priceElement.textContent = newPrice.toFixed(0) + " BYN";
                  if (oldPriceElement) {
                    oldPriceElement.textContent =
                      newOldPrice.toFixed(0) + " BYN";
                  }
                } else {
                  newPrice = basePrice * optionQuantity;
                  priceElement.textContent = newPrice.toFixed(0) + " BYN";
                }
              }

              for (const option of quantityOptions) {
                option.addEventListener("click", function (e) {
                  e.preventDefault();
                  e.stopPropagation();

                  count = 1;
                  counter.textContent = count;

                  const optionText = this.textContent.trim();
                  const optionQuantity = parseFloat(optionText);

                  const isActive = this.classList.contains(
                    "popular__products__card__quantity__active"
                  );

                  if (isActive) {
                    for (const opt of quantityOptions) {
                      opt.classList.remove(
                        "popular__products__card__quantity__active"
                      );
                      if (discountPercent > 0) {
                        newPrice = discountedPrice;
                        newOldPrice = basePrice;

                        priceElement.textContent = newPrice.toFixed(0) + " BYN";
                        if (oldPriceElement) {
                          oldPriceElement.textContent =
                            newOldPrice.toFixed(0) + " BYN";
                        }
                      } else {
                        newPrice = basePrice;
                        priceElement.textContent = newPrice.toFixed(0) + " BYN";
                      }
                    }
                  } else {
                    for (const opt of quantityOptions) {
                      opt.classList.remove(
                        "popular__products__card__quantity__active"
                      );
                    }
                    this.classList.add(
                      "popular__products__card__quantity__active"
                    );

                    if (discountPercent > 0) {
                      newPrice = optionQuantity * discountedPrice;
                      newOldPrice = optionQuantity * basePrice;

                      priceElement.textContent = newPrice.toFixed(0) + " BYN";
                      if (oldPriceElement) {
                        oldPriceElement.textContent =
                          newOldPrice.toFixed(0) + " BYN";
                      }
                    } else {
                      newPrice = optionQuantity * basePrice;
                      priceElement.textContent = newPrice.toFixed(0) + " BYN";
                    }
                  }
                });
              }
            }

            function setInputBuyClick() {
              const setWeightShow = buyModal.querySelector(
                ".buy__modal__card__btn"
              );
              const setWeightInputContainer = buyModal.querySelector(
                ".buy__modal__card__set__weight__box"
              );
              const weightInput = buyModal.querySelector(
                ".product__page__modal__set__weight__value"
              );
              const weightButton = buyModal.querySelector(
                ".product__page__modal__set__weight__btn"
              );
              const optionActive = buyModal.querySelector(
                ".popular__products__card__quantity__active"
              );
              const priceElement = buyModal.querySelector(
                ".buy__modal__card__price"
              );
              const oldPriceElement = buyModal.querySelector(
                ".buy__modal__card__old__price"
              );

              if (setWeightShow && setWeightInputContainer) {
                setWeightShow.addEventListener("click", function (e) {
                  e.preventDefault();
                  e.stopPropagation();

                  if (setWeightInputContainer.style.display === "flex") {
                    setWeightInputContainer.style.display = "none";
                  } else {
                    setWeightInputContainer.style.display = "flex";
                  }
                });
              }

              if (weightInput) {
                weightInput.addEventListener("input", function (event) {
                  let value = event.target.value;

                  value = value.replace(/[^\d,.]/g, "");

                  const hasComma = value.includes(",");
                  const hasDot = value.includes(".");

                  if (hasComma && hasDot) {
                    const commaIndex = value.indexOf(",");
                    const dotIndex = value.indexOf(".");

                    if (commaIndex < dotIndex) {
                      value = value.replace(/\./g, "");
                    } else {
                      value = value.replace(/,/g, "");
                    }
                  }
                  event.target.value = value;
                });
              }

              if (weightButton && weightInput) {
                weightButton.addEventListener("click", function () {
                  const InputValue = weightInput.value;
                  const weightValue = parseFloat(InputValue.replace(",", "."));

                  if (discountPercent) {
                    priceElement.textContent =
                      (discountedPrice * weightValue).toFixed(0) + " BYN";
                    if (oldPriceElement) {
                      oldPriceElement.textContent =
                        (basePrice * weightValue).toFixed(0) + " BYN";
                    }
                  } else {
                    priceElement.textContent =
                      (basePrice * weightValue).toFixed(0) + " BYN";
                  }

                  if (optionActive) {
                    optionActive.classList.remove(
                      "popular__products__card__quantity__active"
                    );
                  }

                  weightInput.value = "";
                  setWeightInputContainer.style.display = "none";
                });
              }
            }

            function addTotalBuyClick() {
              const add = buyModal.querySelector(".modal__operator__add");
              const takeAway = buyModal.querySelector(
                ".modal__operator__take__away"
              );
              const priceElement = buyModal.querySelector(
                ".buy__modal__card__price"
              );
              const oldPriceElement = buyModal.querySelector(
                ".buy__modal__card__old__price"
              );
              const counter = buyModal.querySelector(
                ".product__page__pay__counter"
              );

              counter.textContent = count;

              add.addEventListener("click", function (e) {
                count++;
                counter.textContent = count;

                const quantityActive = buyModal.querySelector(
                  ".popular__products__card__quantity__active"
                );

                let multiplier = 1;

                if (quantityActive) {
                  const quantityActiveText = quantityActive.textContent.trim();
                  multiplier = parseFloat(quantityActiveText);
                }

                if (discountPercent > 0) {
                  const newPrice = discountedPrice * multiplier * count;
                  const newOldPrice = basePrice * multiplier * count;

                  priceElement.textContent = newPrice.toFixed(0) + " BYN";
                  if (oldPriceElement) {
                    oldPriceElement.textContent =
                      newOldPrice.toFixed(0) + " BYN";
                  }
                } else {
                  const newPrice = basePrice * multiplier * count;
                  priceElement.textContent = newPrice.toFixed(0) + " BYN";
                }
              });

              takeAway.addEventListener("click", function (e) {
                if (count > 1) {
                  count--;
                  counter.textContent = count;

                  const quantityActive = buyModal.querySelector(
                    ".popular__products__card__quantity__active"
                  );
                  let multiplier = 1;
                  if (quantityActive) {
                    const quantityActiveText =
                      quantityActive.textContent.trim();
                    multiplier = parseFloat(quantityActiveText);
                  }

                  if (discountPercent > 0) {
                    const newPrice = discountedPrice * multiplier * count;
                    const newOldPrice = basePrice * multiplier * count;

                    priceElement.textContent = newPrice.toFixed(0) + " BYN";
                    if (oldPriceElement) {
                      oldPriceElement.textContent =
                        newOldPrice.toFixed(0) + " BYN";
                    }
                  } else {
                    const newPrice = basePrice * multiplier * count;
                    priceElement.textContent = newPrice.toFixed(0) + " BYN";
                  }
                }
              });
            }

            function initNameValidationAndSent() {
              const nameInput = document.getElementById("buy-name");
              const phoneInput = document.getElementById("buy-phone");
              const sentInput = buyModal.querySelector(
                ".buy__modal__card__form__btn"
              );

              if (nameInput) {
                nameInput.addEventListener("input", function () {
                  const cursorPosition = this.selectionStart;

                  this.value = this.value.replace(/[^А-Яа-яЁё\s]/g, "");
                  this.value = this.value.replace(/\s+/g, " ");

                  if (this.value.startsWith(" ")) {
                    this.value = this.value.substring(1);
                  }

                  this.value = this.value.replace(/\s+/g, " ");
                });
              }

              if (phoneInput) {
                phoneInput.addEventListener("input", function (e) {
                  const cursorPosition = this.selectionStart;

                  let value = this.value.replace(/[^\d+]/g, "");

                  if (!value.startsWith("+")) {
                    value = "+";
                  }

                  this.value = value;
                });
              }

              sentInput.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                function checkFromFilled() {
                  const isNameFilled =
                    nameInput && nameInput.value.trim() !== "";
                  const isPhoneFilled =
                    phoneInput && phoneInput.value.trim() !== "";

                  return isNameFilled && isPhoneFilled;
                }

                if (!checkFromFilled()) {
                  alert(
                    "Пожалуйста, заполните все обязательные поля перед оформлением заказа!"
                  );
                  return;
                }
                const priceElement = buyModal.querySelector(
                  ".buy__modal__card__price"
                );
                const counter = buyModal.querySelector(
                  ".product__page__pay__counter"
                );
                const quantityActive = buyModal.querySelector(
                  ".popular__products__card__quantity__active"
                );

                const orderData = {
                  productId: product.id,
                  prdoductPrice: parseFloat(priceElement.textContent),
                  count: parseFloat(counter.textContent),
                  Name: nameInput.value.trim(),
                  Phone: phoneInput.value.trim(),
                };

                if (quantityActive) {
                  orderData.quantityOption = parseFloat(
                    quantityActive.textContent
                  );
                }

                localStorage.setItem("SentItem", JSON.stringify(orderData));
                console.log("Данные заказа сохранены:", orderData);

                buyModal.style.display = "none";

                const successModal = document.createElement("div");
                successModal.className = "success__modal";
                successModal.innerHTML = `
            <div class="success__modal__wrap">
            <span class="succes__modal__close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z" fill="#5C5F62"/>
            </svg>
            </span>
            <div>
            <svg class="success__modal__img" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C35.0457 4 44 12.9543 44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4ZM32.6339 17.6161C32.1783 17.1605 31.4585 17.1301 30.9676 17.525L30.8661 17.6161L20.75 27.7322L17.1339 24.1161C16.6457 23.628 15.8543 23.628 15.3661 24.1161C14.9105 24.5717 14.8801 25.2915 15.275 25.7824L15.3661 25.8839L19.8661 30.3839C20.3217 30.8395 21.0416 30.8699 21.5324 30.475L21.6339 30.3839L32.6339 19.3839C33.122 18.8957 33.122 18.1043 32.6339 17.6161Z" fill="#008060"/>
            </svg>
            </div>
            <h1 class="success__modal__title">Мы получили вашу заявку</h1>
            <p class="success__modal__text">Ожидайте звонка в течение 15 минут</p>
            <button class="success__modal__btn">Понятно, жду</button>
            </div>
            `;

                document.body.appendChild(successModal);

                function closeSuccessModal() {
                  const closeButton = successModal.querySelector(
                    ".succes__modal__close"
                  );
                  const waitButton = successModal.querySelector(
                    ".success__modal__btn"
                  );

                  closeButton.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    successModal.style.display = "none";
                    overlay.style.display = "none";
                  });

                  waitButton.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    successModal.style.display = "none";
                    overlay.style.display = "none";
                  });
                }

                closeSuccessModal();
              });
            }

            setOptionsBuyClick();
            setInputBuyClick();
            addTotalBuyClick();
            initNameValidationAndSent();

            const closeBuyModal = buyModal.querySelector(".buy__modal__close");
            closeBuyModal.addEventListener("click", function () {
              overlay.style.display = "none";
              buyModal.style.display = "none";
            });
          });
        }

        overlay.addEventListener("click", function () {
          overlay.style.display = "none";
          buyModal.style.display = "none";

          const successModal = document.querySelector(".success__modal");
          if (successModal) {
            successModal.style.display = "none";
          }
        });
      }
    }
  };
});
