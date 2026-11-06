/**
 * Get the image URL for a teacher
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The full URL to the image or placeholder
 */
export const getTeacherImageUrl = (imagePath) => {
  // If no image path, use placeholder
  if (!imagePath || imagePath.trim() === '') {
    return '/uploads/avatars/placeholder-teacher.png';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Normalize Windows backslashes to forward slashes
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Ensure path starts with /uploads/ for the API
  const cleanPath = normalizedPath.startsWith('/') 
    ? normalizedPath 
    : `/${normalizedPath}`;
  
  return cleanPath;
};

/**
 * Handle image load error by setting placeholder
 * @param {Event} e - The error event
 */
export const handleImageError = (e) => {
  if (!e.target.src.includes('placeholder-teacher.png')) {
    e.target.src = '/uploads/avatars/placeholder-teacher.png';
  }
};
