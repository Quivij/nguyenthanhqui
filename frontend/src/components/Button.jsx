import PropTypes from "prop-types";

const Button = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-500 text-white p-2 rounded-lg mt-4 hover:bg-blue-600 transition"
    >
      {text}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export { Button };
