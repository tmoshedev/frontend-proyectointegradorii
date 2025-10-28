import React from 'react';

const PlantillasDocumentosSkeleton: React.FC = () => {
  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="app-pdf-templates">
          {/* Header Skeleton */}
          <div className="app-pdf-template-header">
            <div className="skeleton-header-title"></div>
            <div className="skeleton-header-subtitle"></div>
          </div>

          {/* Content Skeleton */}
          <div className="app-pdf-template-content">
            {/* Left Panel Skeleton */}
            <div className="app-pdf-template-content-left">
              <div className="d-flex justify-content-between align-items-center">
                <div className="skeleton-section-title"></div>
                <div className="skeleton-add-button"></div>
              </div>

              <div className="app-pdf-template-list">
                {/* Generate 5 template item skeletons */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="app-pdf-template-item skeleton-template-item">
                    <div className="skeleton-template-name"></div>
                    <div className="skeleton-template-type"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel Skeleton */}
            <div className="app-pdf-template-content-right d-flex flex-column">
              <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center">
                <div className="skeleton-image"></div>
                <div className="skeleton-select-text"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantillasDocumentosSkeleton;
