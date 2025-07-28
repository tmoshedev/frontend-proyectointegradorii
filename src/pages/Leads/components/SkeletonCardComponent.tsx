export const SkeletonCardComponent = () => {
  return (
    <div className="kanban-card skeleton-shimmer">
      {/* Cabecera de la tarjeta */}
      <div className="kanban-card-header">
        <h4 className="kanban-card-title">
          <div className="skeleton skeleton-text"></div>
        </h4>
        <small>
          <div className="skeleton skeleton-text-sm"></div>
        </small>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="kanban-card-body">
        <div className="skeleton skeleton-text-xs mt-2"></div>
        <div className="d-flex flex-wrap gap-2 mt-1">
          <div className="skeleton skeleton-badge"></div>
          <div className="skeleton skeleton-badge"></div>
        </div>

        <div className="skeleton skeleton-text-xs mt-3"></div>
        <div className="skeleton skeleton-text-xs mt-2"></div>

        <div className="d-flex justify-content-center mt-3">
          <div className="skeleton skeleton-pill"></div>
        </div>
      </div>

      {/* Footer de la tarjeta */}
      <div className="d-flex kanban-card-footer justify-content-between align-items-center mt-3">
        {/* Lado izquierdo del footer */}
        <div>
          <div className="skeleton skeleton-avatar"></div>
        </div>

        {/* Lado derecho: botón de editar */}
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );
};

export default SkeletonCardComponent;
