import "../css/Buttoncss.css";

const LoadingButton = ({
  children,
  loading = false,
  type = "button",
  variant = "primary",
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${loading ? "btn-loading" : ""}`}
      disabled={loading}
    >
      {loading ? <span className="spinner" /> : children}
    </button>
  );
};

export default LoadingButton;
