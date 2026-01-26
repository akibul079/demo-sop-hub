// src/utils/errorHandler.ts
export const handleError = (error: any, context: string = '') => {
  console.error(`Error in ${context}:`, error);
  
  // User-friendly error messages
  if (error.message?.includes('JWT')) {
    return 'Session expired. Please login again.';
  }
  if (error.message?.includes('unique constraint')) {
    return 'This item already exists.';
  }
  if (error.code === 'PGRST116') {
    return 'Item not found.';
  }
  if (error.message?.includes('row-level security')) {
    return 'Permission denied. Please contact your administrator.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};
