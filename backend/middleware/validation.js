export const validateReview = (req, res, next) => {
  const { teacher, course, term, rating, textContent } = req.body;

  if (!teacher) {
    return res.status(400).json({ message: 'Teacher is required' });
  }
  if (!course || course.trim() === '') {
    return res.status(400).json({ message: 'Course is required' });
  }
  if (!term || term.trim() === '') {
    return res.status(400).json({ message: 'Term is required' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  if (!textContent || textContent.trim() === '') {
    return res.status(400).json({ message: 'Review text is required' });
  }

  next();
};

