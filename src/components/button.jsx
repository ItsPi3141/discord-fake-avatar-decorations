export const NeutralButton = ({ children, onClick }) => {
  return (
    <button
      className="flex justify-center items-center gap-1.5 mt-3 py-1.5 button-secondary"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
