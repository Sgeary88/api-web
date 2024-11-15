// Create an array to hold promises
const imagePromises = [];
const favorites = [];
let dogImages = []; // Store the dog image elements for sorting
let favoriteImages = []; // Store the favorite image elements for sorting

// Fetch 30 random dog images
for (let i = 0; i < 30; i++) {
  imagePromises.push(fetch("https://dog.ceo/api/breeds/image/random"));
}

Promise.all(imagePromises)
  .then((responses) => {
    return Promise.all(
      responses.map((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
    );
  })
  .then((dataArray) => {
    const dogImagesContainer = document.getElementById("dog-images-container");
    const favoritesContainer = document.getElementById("favorites-container");
    const sortButton = document.getElementById("sort-toggle");
    let isAscending = true;

    // Function to extract breed name from the image URL
    function getBreedName(imageUrl) {
      const parts = imageUrl.split("/");
      const breed = parts[4]; // The breed name is typically the 5th part of the URL
      return breed.charAt(0).toUpperCase() + breed.slice(1); // Capitalize first letter
    }

    // Create and append a card for each dog image
    dataArray.forEach((data) => {
      const breed = getBreedName(data.message);
      const dogCard = document.createElement("div");
      dogCard.className = "dog-card";

      const imgElement = document.createElement("img");
      imgElement.src = data.message;
      imgElement.alt = `${breed} Image`;

      const captionElement = document.createElement("p");
      captionElement.textContent = breed; // Display breed name

      const addToFavoritesButton = document.createElement("button");
      addToFavoritesButton.textContent = "Add to Favorites";
      addToFavoritesButton.addEventListener("click", () => {
        addToFavorites(data, breed, dogCard); // Pass breed name
      });

      dogCard.appendChild(imgElement);
      dogCard.appendChild(captionElement);
      dogCard.appendChild(addToFavoritesButton);

      dogImages.push(dogCard); // Store the DOM element to be sorted later
      dogImagesContainer.appendChild(dogCard);
    });

    // Function to add item to Favorites
    function addToFavorites(data, breed, dogCard) {
      dogImagesContainer.removeChild(dogCard);
      favorites.push({ data, breed }); // Store both data and breed name

      const favoriteCard = document.createElement("div");
      favoriteCard.className = "dog-card";

      const imgElement = document.createElement("img");
      imgElement.src = data.message;
      imgElement.alt = "Dog Image";

      const captionElement = document.createElement("p");
      captionElement.textContent = breed; // Use breed passed in

      const removeFromFavoritesButton = document.createElement("button");
      removeFromFavoritesButton.textContent = "Remove from Favorites";
      removeFromFavoritesButton.addEventListener("click", () => {
        removeFromFavorites(data, favoriteCard);
      });

      favoriteCard.appendChild(imgElement);
      favoriteCard.appendChild(captionElement);
      favoriteCard.appendChild(removeFromFavoritesButton);

      favoriteImages.push(favoriteCard); // Keep track of favorites for sorting
      favoritesContainer.appendChild(favoriteCard);
    }

    // Function to remove item from Favorites
    function removeFromFavorites(data, favoriteCard) {
      favoritesContainer.removeChild(favoriteCard);

      const index = favorites.findIndex((item) => item.data === data);
      if (index > -1) favorites.splice(index, 1);

      // Recreate the dog card with an "Add to Favorites" button
      const dogCard = document.createElement("div");
      dogCard.className = "dog-card";

      const imgElement = document.createElement("img");
      imgElement.src = data.message;
      imgElement.alt = "Dog Image";

      const captionElement = document.createElement("p");
      captionElement.textContent = "A cute dog!";

      const addToFavoritesButton = document.createElement("button");
      addToFavoritesButton.textContent = "Add to Favorites";
      addToFavoritesButton.addEventListener("click", () => {
        addToFavorites(data, getBreedName(data.message), dogCard); // Pass breed again
      });

      dogCard.appendChild(imgElement);
      dogCard.appendChild(captionElement);
      dogCard.appendChild(addToFavoritesButton);

      dogImages.push(dogCard); // Re-add to dogImages for sorting
      dogImagesContainer.appendChild(dogCard);
    }

    // Sort and render the collection
    function sortAndRender(container, items, isAscending) {
      items.sort((a, b) => {
        const textA = a.querySelector("p").textContent;
        const textB = b.querySelector("p").textContent;

        // Sorting logic
        for (let i = 0; i < Math.min(textA.length, textB.length); i++) {
          const charA = textA.charCodeAt(i);
          const charB = textB.charCodeAt(i);

          if (charA !== charB) {
            return isAscending ? charA - charB : charB - charA;
          }
        }

        return isAscending
          ? textA.length - textB.length
          : textB.length - textA.length;
      });

      // Append the sorted items without clearing the container
      items.forEach((item) => container.appendChild(item));
    }

    // Toggle sort order and update button text
    sortButton.addEventListener("click", () => {
      isAscending = !isAscending;
      sortButton.textContent = isAscending
        ? "Sort Alphabetically (Z-A)"
        : "Sort Alphabetically (A-Z)";

      // Sort the dogImages and favorites independently
      sortAndRender(dogImagesContainer, dogImages, isAscending);
      sortAndRender(favoritesContainer, favoriteImages, isAscending);
    });
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });
