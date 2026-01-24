import defaultImage from "../assets/news.png";

/**
 * Returns a valid image for news cards.
 * If API image is missing / empty, fallback to default image.
 */
export const getNewsImage = (urlToImage) => {
  if (!urlToImage || typeof urlToImage !== "string") {
    return defaultImage;
  }

  return urlToImage.trim() === "" ? defaultImage : urlToImage;
};
