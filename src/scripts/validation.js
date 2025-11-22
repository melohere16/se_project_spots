export const settings = {
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error_visible",
};

export function enableValidation(config) {
  const forms = Array.from(document.querySelectorAll(".modal__form"));
  forms.forEach((form) => {
    form.addEventListener("input", (evt) => handleInput(evt, config));
  });
}

function handleInput(evt, config) {
  const form = evt.currentTarget;
  const input = evt.target;
  const errorSpan = form.querySelector(`#${input.id}-error`);
  const button = form.querySelector(config.submitButtonSelector);

  if (!input.validity.valid) {
    errorSpan.textContent = input.validationMessage;
    input.classList.add(config.inputErrorClass);
  } else {
    errorSpan.textContent = "";
    input.classList.remove(config.inputErrorClass);
  }

  if (!form.checkValidity()) {
    button.disabled = true;
    button.classList.add(config.inactiveButtonClass);
  } else {
    button.disabled = false;
    button.classList.remove(config.inactiveButtonClass);
  }
}

export function resetValidation(form, inputs, config) {
  inputs.forEach((input) => {
    const errorSpan = form.querySelector(`#${input.id}-error`);
    errorSpan.textContent = "";
    input.classList.remove(config.inputErrorClass);
  });

  const button = form.querySelector(config.submitButtonSelector);
  button.disabled = true;
  button.classList.add(config.inactiveButtonClass);
}
