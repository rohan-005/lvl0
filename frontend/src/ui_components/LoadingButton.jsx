import "../css/Buttoncss.css";

const LoadingButton = ({
  children,
  loading = false,
  type = "button",
  variant = "primary",
  loadingStyle = "spinner", // dots | arrow | spinner
}) => {

  const renderLoader = () => {
    if (loadingStyle === "dots") {
      return (
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
      );
    }

    if (loadingStyle === "arrow") {
      return (
        <div className="arrow-loader">
          <span className="arrow" />
        </div>
      );
    }

    return <span className="spinner" />;
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${loading ? "btn-loading" : ""}`}
      disabled={loading}
    >
      {loading ? renderLoader() : children}
    </button>
  );
};

export default LoadingButton;
