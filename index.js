// Create an array to hold promises
const imagePromises = [];
const favorites = [];
let dogImages = [];
let favoriteImages = [];

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

    // Function to get breed name from the image URL
    function getBreedName(imageUrl) {
      const parts = imageUrl.split("/");
      const breed = parts[4];
      return breed.charAt(0).toUpperCase() + breed.slice(1);
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
      captionElement.textContent = breed;

      const addToFavoritesButton = document.createElement("button");
      addToFavoritesButton.textContent = "Add to Favorites";
      addToFavoritesButton.addEventListener("click", () => {
        addToFavorites(data, breed, dogCard);
      });

      dogCard.appendChild(imgElement);
      dogCard.appendChild(captionElement);
      dogCard.appendChild(addToFavoritesButton);

      dogImages.push(dogCard);
      dogImagesContainer.appendChild(dogCard);
    });

    // Function to add item to Favorites
    function addToFavorites(data, breed, dogCard) {
      dogImagesContainer.removeChild(dogCard);
      favorites.push({ data, breed });

      const favoriteCard = document.createElement("div");
      favoriteCard.className = "dog-card";

      const imgElement = document.createElement("img");
      imgElement.src = data.message;
      imgElement.alt = "Dog Image";

      const captionElement = document.createElement("p");
      captionElement.textContent = breed;

      const removeFromFavoritesButton = document.createElement("button");
      removeFromFavoritesButton.textContent = "Remove from Favorites";
      removeFromFavoritesButton.addEventListener("click", () => {
        removeFromFavorites(data, favoriteCard);
      });

      favoriteCard.appendChild(imgElement);
      favoriteCard.appendChild(captionElement);
      favoriteCard.appendChild(removeFromFavoritesButton);

      favoriteImages.push(favoriteCard);
      favoritesContainer.appendChild(favoriteCard);
    }

    // Function to remove item from Favorites
    function removeFromFavorites(data, favoriteCard) {
      favoritesContainer.removeChild(favoriteCard);

      const index = favorites.findIndex((item) => item.data === data);
      if (index > -1) favorites.splice(index, 1);

      // move card back to collection
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
        addToFavorites(data, getBreedName(data.message), dogCard);
      });

      dogCard.appendChild(imgElement);
      dogCard.appendChild(captionElement);
      dogCard.appendChild(addToFavoritesButton);

      dogImages.push(dogCard);
      dogImagesContainer.appendChild(dogCard);
    }

    // Sort and render the collection
    function sortAndRender(container, items, isAscending) {
      items.sort((a, b) => {
        const textA = a.querySelector("p").textContent;
        const textB = b.querySelector("p").textContent;

        // Sorting
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

      items.forEach((item) => container.appendChild(item));
    }

    // Toggle button
    sortButton.addEventListener("click", () => {
      isAscending = !isAscending;
      sortButton.textContent = isAscending
        ? "Sort Alphabetically (Z-A)"
        : "Sort Alphabetically (A-Z)";

      // Sort images in list and favorites
      sortAndRender(dogImagesContainer, dogImages, isAscending);
      sortAndRender(favoritesContainer, favoriteImages, isAscending);
    });
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });

// Fetch the breed list and sub-breeds
fetch("https://dog.ceo/api/breeds/list/all")
  .then((response) => response.json())
  .then((data) => {
    const breedList = data.message;

    // Sum the number of subtypes for each breed
    let totalSubtypes = 0;
    for (const breed in breedList) {
      if (breedList.hasOwnProperty(breed)) {
        const subtypes = breedList[breed];
        totalSubtypes += Array.isArray(subtypes) ? subtypes.length : 0;
      }
    }

    // Display the total number of subtypes
    const totalSubtypesElement = document.getElementById("total-subtypes");
    if (totalSubtypesElement) {
      totalSubtypesElement.textContent = `Total number of subtypes: ${totalSubtypes}`;
    } else {
      console.error("Element with id 'total-subtypes' not found");
    }
  })
  .catch((error) => {
    console.error("Error fetching breed list:", error);
  });
