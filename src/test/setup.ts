import '@testing-library/jest-dom/vitest'

// jsdom has no native modal lifecycle; browser checks cover real focus trapping.
HTMLDialogElement.prototype.showModal = function () {
  this.open = true
  this.querySelector('button')?.focus()
}
HTMLDialogElement.prototype.close = function () {
  this.open = false
}
