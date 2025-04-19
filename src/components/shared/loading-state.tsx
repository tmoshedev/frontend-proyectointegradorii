export const LoadingState = () => {
  return (
    <div className="loader-state">
      <div className="state-loading">
        <span className="loader-two"></span>
      </div>
      <center className="fixed-bottom title" style={{ position: 'fixed' }}>
        {import.meta.env.VITE_APP_NAME}
      </center>
    </div>
  );
};

export default LoadingState;
