import { useState } from "preact/hooks";
import { Icons } from "./icons";

export default function SearchBar({ onValueChanged, placeholder }) {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        className="pr-12 w-full text-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          // @ts-ignore
          setQuery(e.target.value);
          // @ts-ignore
          onValueChanged(e.target.value);
        }}
      />
      {query.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onValueChanged("");
          }}
          className="top-1/2 right-4 absolute h-fit text-text-muted hover:text-white transition-colors -translate-y-1/2 transform"
        >
          <Icons.close size="1.25em" />
        </button>
      ) : (
        <div className="top-1/2 right-4 absolute text-text-muted -translate-y-1/2 transform">
          <Icons.search size="1.25em" />
        </div>
      )}
    </div>
  );
}
