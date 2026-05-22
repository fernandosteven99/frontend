function Button({ children, onClick, color = "primary", disabled = false, width = "auto" }) {
  const classes = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${classes[color]} px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ width: width }}
    >
      {children}
    </button>
  );
}

export default Button;