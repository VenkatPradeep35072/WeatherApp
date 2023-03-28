const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent the default form submission behavior
  const formData = new FormData(form);
  // do something with the form data
});
fetch("http://127.0.0.1:8000/login", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));