const button = document.getElementById("login");
const email = document.getElementById("email");
const password = document.getElementById("password");
const register = document.getElementById("register");
const login = document.getElementById("signIn");
const image = document.getElementById("image");
const btnSearch = document.getElementById("search");
const query = document.getElementById("query");
const username = document.getElementById("username");
const btnLogout = document.getElementById("logout");
const loading = document.querySelector(".loading");
const btnFavorites = document.getElementById("favorites");

const loginContainer = document.querySelector(".login");
const userContainer = document.querySelector(".user");
const btnLike = document.querySelector(".like");
const listItem = document.querySelector(".list");

let currentUser;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    var uid = user.uid;
    loginContainer.classList.add("hidden");
    userContainer.classList.remove("hidden");
    currentUser = user;
    username.textContent = `Hi, ${user.email}`;
    // ...
  } else {
    // User is signed out
    loginContainer.classList.remove("hidden");
    userContainer.classList.add("hidden");
  }
});

const getItem = async function (query) {
  image.src = `loading.jpg`;
  loading.classList.add("hidden");
  btnLike.classList.remove("liked");
  const search = await fetch(
    `https://foodish-api.herokuapp.com/images/${query}/`
  );
  image.style.opacity = "0.4";
  const rand = Math.trunc(Math.random() * 35) + 1;
  const img = `${search.url}${query}${rand}.jpg`;
  image.src = img;
};

function AddFavorite(userId, imageUrl) {
  firebase
    .database()
    .ref("users/" + userId)
    .push()
    .set({
      image: imageUrl,
    });
}

button.addEventListener("click", function (e) {
  if (!email.value || !password.value) return alert("Enter email or password");
  // Register User
  if (button.textContent === "REGISTER") {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email.value, password.value)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert(`Thanks for creating account with us ${user.email}`);
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(`Registration Failed: ${errorMessage}`);
        // ..
      });
  } else {
    // Login User
    firebase
      .auth()
      .signInWithEmailAndPassword(email.value, password.value)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;

        alert(`Error : ${errorMessage}`);
      });
  }
});

register.addEventListener("click", function (e) {
  if (register.textContent === "Sign Up") {
    register.textContent = "Sign In";
    button.textContent = "REGISTER";
    login.textContent = "Sign Up";
  } else {
    register.textContent = "Sign Up";
    button.textContent = "LOGIN";
    login.textContent = "Sign In";
  }
});

btnSearch.addEventListener("click", function (e) {
  const value = query.value.toLowerCase();
  if (!value) return alert("Please enter a search value");
  getItem(value);
});

btnLogout.addEventListener("click", function (e) {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      alert(`We are expecting you soon!`);
    })
    .catch((error) => {
      // An error happened.
      alert(`Error: ${error}`);
    });
});

btnLike.addEventListener("click", function () {
  if (image.src.includes("loading.jpg"))
    return alert("Kindly search for real images");
  btnLike.classList.toggle("liked");
  AddFavorite(currentUser.uid, image.src);
  alert("Favorite was successfully saved");
});

btnFavorites.addEventListener("click", function () {
  listItem.innerHTML = "";
  if (listItem.innerHTML === "") {
    let count = 1;
    firebase
      .database()
      .ref()
      .child("users")
      .child(currentUser.uid)
      .once("child_added", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          const html = `
          <li class="item">
            <span>${count}</span>
            <img src="${childData}" alt="Favorites" class="fav" />
          </li>`;
          listItem.insertAdjacentHTML("beforeend", html);
          ++count;
        });
      });
  }
});

image.addEventListener("load", function () {
  image.style.opacity = "1";
  loading.classList.toggle("hidden");
});

listItem.addEventListener("click", function (e) {
  const imageUrl = e.target.closest(".fav")?.src;
  if (!imageUrl) return;
  image.src = `loading.jpg`;
  loading.classList.remove("hidden");
  btnLike.classList.add("liked");
  image.style.opacity = "0.4";
  image.src = imageUrl;
});
