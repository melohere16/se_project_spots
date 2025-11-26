export function setButtonText(button, isSaving, savingText, defaultText) {
  if (!button) return;
  button.textContent = isSaving ? savingText : defaultText;
}
