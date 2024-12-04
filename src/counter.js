export function setupCounter(element) {
  let counter = -100
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `Berham is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(-100)
}
