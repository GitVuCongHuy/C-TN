import React, { useState } from 'react';
import styles from './ProductReviews.module.css';

const ProductReviews = ({ reviews }) => {
  const [filterStars, setFilterStars] = useState(0); 

  if (!reviews || reviews.length === 0) {
    return <p>No reviews available.</p>;
  }
  const averageRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1);
  const filteredReviews =
    filterStars > 0
      ? reviews.filter((review) => review.rating === filterStars)
      : reviews;

  return (
    <div className={styles.container}>
      <h2>Reviews</h2>
      <div className={styles.summary}>
        <span className={styles.averageRating}>⭐ {averageRating}</span>
        <span>({reviews.length} reviews)</span>
      </div>

      {/* Bộ lọc sao */}
      <div className={styles.filters}>
        <button
          className={filterStars === 0 ? styles.active : ''}
          onClick={() => setFilterStars(0)}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            className={filterStars === star ? styles.active : ''}
            onClick={() => setFilterStars(star)}
          >
            {star} ⭐
          </button>
        ))}
      </div>

      {/* Danh sách đánh giá */}
      <div className={styles.reviews}>
        {filteredReviews.map((review, index) => (
          <div className={styles.reviewCard} key={index}>
            <h4>{review.reviewerName}</h4>
            <p className={styles.comment}>{review.comment}</p>
            <div className={styles.rating}>⭐ {review.rating}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
