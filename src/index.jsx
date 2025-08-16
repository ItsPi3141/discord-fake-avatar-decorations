import { LocationProvider, Router, Route, hydrate, prerender as ssr } from "preact-iso";

import Home from "@/pages/page.jsx";
import Discussion from "@/pages/discuss/page.jsx";
import GifExtractor from "@/pages/gif-extractor/page.jsx";
import { NotFound } from "@/pages/_404.jsx";

import "@/global.css";
import { FontPreloader } from "@/components/fontpreload.jsx";
import { Utils } from "@/components/utils.jsx";

export function App() {
  return (
    <LocationProvider>
      <div className="bg-base-lower w-screen overflow-x-hidden">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/discuss" component={Discussion} />
          <Route path="/gif-extractor" component={GifExtractor} />
          <Route default component={NotFound} />
        </Router>
        <FontPreloader />
        <Utils />
      </div>
    </LocationProvider>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
