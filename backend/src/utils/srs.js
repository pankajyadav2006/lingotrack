/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * @param {number} quality - Rating of response quality (0-5)
 *  0: Complete blackout
 *  1: Incorrect response, but remembered the correct one
 *  2: Incorrect response, but the correct one seemed easy to recall
 *  3: Correct response recalled with serious difficulty
 *  4: Correct response after a hesitation
 *  5: Perfect response
 * @param {number} repetitions - Number of consecutive correct responses
 * @param {number} easeFactor - Easiness factor (usually starts at 2.5)
 * @param {number} interval - Current inter-repetition interval in days
 * @returns {Object} Object containing the updated SM-2 fields
 */
exports.calculateNextReview = (quality, repetitions = 0, easeFactor = 2.5, interval = 0) => {
  let newInterval;
  let newRepetitions;
  let newEaseFactor;

  // Calculate new ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Calculate new interval and repetitions based on quality
  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response
    newRepetitions = 0;
    newInterval = 1;
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    nextReviewDate
  };
};
