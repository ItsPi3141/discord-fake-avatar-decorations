import "./twemoji.css";

const Twemoji = ({ emoji }) => (
  <img
    class={"emoji"}
    draggable={false}
    src={`https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/svg/${emoji}.svg`}
    alt={String.fromCodePoint(parseInt(emoji, 16))}
    loading={"lazy"}
  />
);

export default Twemoji;
