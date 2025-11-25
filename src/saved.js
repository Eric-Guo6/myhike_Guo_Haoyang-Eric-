import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

// Display saved hikes for the current user
function displaySavedHikes() {
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady(async (user) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "index.html";
      return;
    }

    try {
      // 1. Get user document to read bookmarks
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.log("No user document found");
        return;
      }

      const userData = userDoc.data();
      const bookmarks = userData.bookmarks || [];

      // 2. Display user's name
      const name = userData.name || user.displayName || user.email;
      if (nameElement) {
        nameElement.textContent = name;
      }

      // 3. Display saved hikes
      await displaySavedCards(bookmarks);
    } catch (error) {
      console.error("Error loading saved hikes:", error);
    }
  });
}

async function displaySavedCards(bookmarkIds) {
  const cardTemplate = document.getElementById("savedCardTemplate");
  const cardGroup = document.getElementById("hikeCardGroup");

  // Clear existing cards
  cardGroup.innerHTML = "";

  if (bookmarkIds.length === 0) {
    cardGroup.innerHTML = "<p>You haven't saved any hikes yet.</p>";
    return;
  }

  try {
    // Get all hikes to filter by bookmarks
    const hikesRef = collection(db, "hikes");
    const querySnapshot = await getDocs(hikesRef);

    // Filter hikes that are in bookmarks
    const savedHikes = [];
    querySnapshot.forEach((docSnap) => {
      if (bookmarkIds.includes(docSnap.id)) {
        savedHikes.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
    });

    // Display each saved hike
    savedHikes.forEach((hike) => {
      const newCard = cardTemplate.content.cloneNode(true);

      // Populate card with hike data
      newCard.querySelector(".card-title").textContent = hike.name;
      newCard.querySelector(".card-text").textContent =
        hike.details || `Located in ${hike.city}.`;
      newCard.querySelector(".card-length").textContent = hike.length;

      // Set image
      const cardImage = newCard.querySelector(".card-image");
      cardImage.src = `./images/${hike.code}.jpg`;
      cardImage.alt = `${hike.name} image`;

      // Set read more link
      newCard.querySelector(
        ".read-more"
      ).href = `eachHike.html?docID=${hike.id}`;

      // Add card to the page
      cardGroup.appendChild(newCard);
    });
  } catch (error) {
    console.error("Error loading saved hikes:", error);
    cardGroup.innerHTML = "<p>Error loading saved hikes. Please try again.</p>";
  }
}

// Initialize the page
displaySavedHikes();
