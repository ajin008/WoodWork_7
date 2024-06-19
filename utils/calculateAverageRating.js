const Rating = require("../models/ratingSchema");

const calculateAverageRating = async (productId) => {
  const ratings = await Rating.find({ productId });
  const totalRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const averageRating = totalRatings / ratings.length || 0;
  return averageRating.toFixed(1);
};

module.exports = calculateAverageRating;
