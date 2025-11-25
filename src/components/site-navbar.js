// Import specific functions from the Firebase Auth SDK
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "/src/firebaseConfig.js";
import { logoutUser } from "/src/authentication.js";

class SiteNavbar extends HTMLElement {
  constructor() {
    super();
    this.renderNavbar();
    this.renderAuthControls();
  }

  renderNavbar() {
    this.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-success">
      <div class="container-fluid">
        <a class="navbar-brand" href="/main.html">
          <img src="/images/image.jpg" height="36">
          EricHike
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" href="/main.html">Home</a>
            </li>
            
            <!-- NEW: Saved Hikes link -->
            <li class="nav-item">
              <a class="nav-link" href="/saved.html">Saved</a>
            </li>
            
          </ul>
          <div class="d-flex align-items-center gap-2 ms-lg-2" id="rightControls">
            <form class="d-flex align-items-center gap-2 my-2 my-lg-0" id="navSearch" role="search">
              <input class="form-control d-none d-sm-block w-auto" type="search" placeholder="Search" aria-label="Search">
              <button class="btn btn-outline-light d-none d-sm-inline-block" type="submit">Search</button>
            </form>
            <div id="authControls" class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0">
              <!-- populated by JS -->
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;
  }

  renderAuthControls() {
    const authControls = this.querySelector("#authControls");
    const navList = this.querySelector("ul"); // Get the main nav <ul>

    // Initialize with invisible placeholder to maintain layout space
    authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

    onAuthStateChanged(auth, (user) => {
      let updatedAuthControl;

      // Remove existing "Profile" link if present (avoid duplicates)
      const existingProfile = navList?.querySelector("#profileLink");
      if (existingProfile) existingProfile.remove();

      if (user) {
        // 1️⃣ Add Profile item to menu
        if (navList) {
          const profileItem = document.createElement("li");
          profileItem.classList.add("nav-item");
          profileItem.innerHTML = `<a class="nav-link" id="profileLink" href="/profile.html">Profile</a>`;
          navList.appendChild(profileItem);
        }

        // 2️⃣ Show logout button
        updatedAuthControl = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;
        authControls.innerHTML = updatedAuthControl;

        const signOutBtn = authControls.querySelector("#signOutBtn");
        signOutBtn?.addEventListener("click", logoutUser);
      } else {
        // Remove Profile if user logs out (redundant but safe)
        if (existingProfile) existingProfile.remove();

        // Show login button
        updatedAuthControl = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
        authControls.innerHTML = updatedAuthControl;
      }
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
