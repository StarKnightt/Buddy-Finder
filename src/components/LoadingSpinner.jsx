import React from 'react';

function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status">
      <div className="spinner"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;