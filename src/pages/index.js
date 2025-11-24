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
const avatarEditBtn = document.querySelector(".profile__avatar-edit-btn");

const editProfileModal = document.querySelector("#edit-profile-modal");
const newPostModal = document.querySelector("#new-post-modal");
const avatarModal = document.querySelector("#edit-avatar-modal");
const deleteConfirmModal = document.querySelector("#delete-confirm-modal");
const previewModal = document.querySelector("#preview-modal");

const editProfileForm = editProfileModal.querySelector(".modal__form");
const newPostForm = newPostModal.querySelector(".modal__form");
const avatarForm = avatarModal.querySelector(".modal__form");
const deleteForm = deleteConfirmModal.querySelector(".modal__form");

const editProfileNameInput = editProfileForm.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileForm.querySelector(
  "#profile-description-input"
);
const cardCaptionInput = newPostForm.querySelector("#image-caption-input");
const cardLinkInput = newPostForm.querySelector("#card-image-input");
const avatarLinkInput = avatarForm.querySelector("#avatar-link-input");

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

// Close by clicking on overlay
document.querySelectorAll(".modal").forEach((m) => {
  m.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("modal")) closeModal(m);
  });
});

// ⭐ Close buttons now close their modals
document
  .querySelectorAll(
    ".modal__close-btn, .modal__close-btn_delete, .modal__close-btn_type_preview"
  )
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal) {
        closeModal(modal);
      }
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
        if (updated.isLiked) {
          likeBtn.classList.add(likeActiveClass);
        } else {
          likeBtn.classList.remove(likeActiveClass);
        }
      })
      .catch(console.error);
  });

  deleteBtn.addEventListener("click", () => {
    openModal(deleteConfirmModal);

    const cancelBtn = deleteConfirmModal.querySelector(".modal__cancel-btn");
    cancelBtn.onclick = () => closeModal(deleteConfirmModal);

    deleteForm.onsubmit = (evt) => {
      evt.preventDefault();

      const deleteButton = deleteConfirmModal.querySelector(
        ".modal__submit-btn_delete"
      );

      setButtonText(deleteButton, true, "Deleting...", "Delete");

      api
        .deleteCard(data._id)
        .then(() => {
          cardElement.remove();
          closeModal(deleteConfirmModal);
        })
        .catch(console.error)
        .finally(() => {
          setButtonText(deleteButton, false, "", "Delete");
        });
    };
  });

  return cardElement;
}

editProfileBtn.addEventListener("click", () => {
  editProfileForm.reset();
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );

  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  newPostForm.reset();
  resetValidation(newPostForm, [cardCaptionInput, cardLinkInput], settings);
  openModal(newPostModal);
});

avatarEditBtn.addEventListener("click", () => {
  avatarForm.reset();
  resetValidation(avatarForm, [avatarLinkInput], settings);
  openModal(avatarModal);
});

editProfileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setButtonText(btn, true, "Saving...", "Save");

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
    .finally(() => setButtonText(btn, false, "", "Save"));
});

newPostForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;

  // ⭐ Button text uses "Save" (matches UI)
  setButtonText(btn, true, "Saving...", "Save");

  api
    .addCard({ name: cardCaptionInput.value, link: cardLinkInput.value })
    .then((card) => {
      cardsList.prepend(getCardElement(card));
      newPostForm.reset();
      resetValidation(newPostForm, [cardCaptionInput, cardLinkInput], settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(btn, false, "", "Save"));
});

avatarForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setButtonText(btn, true, "Saving...", "Save");

  api
    .updateAvatar({ avatar: avatarLinkInput.value })
    .then((res) => {
      profileAvatarEl.src = res.avatar;
      avatarForm.reset();
      resetValidation(avatarForm, [avatarLinkInput], settings);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(btn, false, "", "Save"));
});

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
