import "../vendor/normalize.css";
import "./index.css";
import { api } from "../scripts/Api.js";
import {
  enableValidation,
  resetValidation,
  settings,
} from "../scripts/validation.js";
import { setButtonText } from "../scripts/helpers.js";

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

const editProfileBtn = document.querySelector(".profile__edit-btn");
const newPostBtn = document.querySelector(".profile__add-btn");

const editProfileModal = document.querySelector("#edit-profile-modal");
const newPostModal = document.querySelector("#new-post-modal");
const previewModal = document.querySelector("#preview-modal");

const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const addCardFormElement = newPostModal.querySelector(".modal__form");
const cardCaptionInput = addCardFormElement.querySelector(
  "#image-caption-input"
);
const cardLinkInput = addCardFormElement.querySelector("#card-image-input");

const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const active = document.querySelector(".modal_is-opened");
    if (active) closeModal(active);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);
}

document.querySelectorAll(".modal").forEach((m) => {
  m.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("modal")) closeModal(m);
  });
});

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const titleEl = cardElement.querySelector(".card__title");
  const imgEl = cardElement.querySelector(".card__image");
  const likeBtn = cardElement.querySelector(".card__like-button");
  const deleteBtn = cardElement.querySelector(".card__delete-button");
  const likeActiveClass = "card__like-button_active";

  titleEl.textContent = data.name;
  imgEl.src = data.link;
  imgEl.alt = data.name;

  if (data.isLiked) likeBtn.classList.add(likeActiveClass);

  imgEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  likeBtn.addEventListener("click", () => {
    const willLike = !likeBtn.classList.contains(likeActiveClass);
    api
      .changeLikeStatus(data._id, willLike)
      .then((updated) => {
        if (updated.isLiked) likeBtn.classList.add(likeActiveClass);
        else likeBtn.classList.remove(likeActiveClass);
        data.isLiked = updated.isLiked;
      })
      .catch(console.error);
  });

  deleteBtn.addEventListener("click", () => {
    api
      .deleteCard(data._id)
      .then(() => {
        cardElement.remove();
      })
      .catch(console.error);
  });

  return cardElement;
}

editProfileBtn.addEventListener("click", () => {
  openModal(editProfileModal);
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );
});

newPostBtn.addEventListener("click", () => openModal(newPostModal));

editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal)
);
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

function handleEditProfileSubmit(e) {
  e.preventDefault();
  const submitBtn = e.submitter;
  setButtonText(submitBtn, true, "Saving...", "Save");

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((user) => {
      profileNameEl.textContent = user.name;
      profileDescriptionEl.textContent = user.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false, "", "Save"));
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

function handleAddCardSubmit(e) {
  e.preventDefault();
  const submitBtn = e.submitter;
  setButtonText(submitBtn, true, "Saving...", "Create");

  api
    .addCard({ name: cardCaptionInput.value, link: cardLinkInput.value })
    .then((card) => {
      const newCard = getCardElement(card);
      cardsList.prepend(newCard);
      addCardFormElement.reset();
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false, "", "Create"));
}

addCardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);

api
  .getAppInfo()
  .then(([user, cards]) => {
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarEl.src = user.avatar;
    cards.forEach((card) => cardsList.append(getCardElement(card)));
  })
  .catch(console.error);
