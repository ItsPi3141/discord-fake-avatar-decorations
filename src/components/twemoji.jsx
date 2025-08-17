import "./twemoji.css";

const Twemoji = ({ emoji }) => (
  <img
    class={"emoji"}
    draggable={false}
    src={`https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/svg/${emoji}.svg`}
    loading={"lazy"}
  />
);

export default Twemoji;
