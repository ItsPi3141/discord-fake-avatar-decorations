import { Icons } from "@/components/icons";

import Giscus from "@giscus/react";

export default function Discussion() {
  return (
    <main className="flex flex-col h-screen text-white">
      <div className="flex items-center gap-2 bg-base-lower p-4 border-b border-border-faint text-icon-tertiary">
        <Icons.forum size="24px" />
        <p className="font-semibold text-white">Discussions</p>
      </div>
      <div className="overflow-auto discord-scrollbar grow">
        <Giscus
          id="comments"
          repo="ItsPi3141/discord-fake-avatar-decorations"
          repoId="R_kgDOKa2H1A"
          mapping="number"
          term="4"
          reactionsEnabled="0"
          emitMetadata="0"
          inputPosition="top"
          theme={`${
            import.meta.env.VITE_BASE_IMAGE_URL ||
            "https://itspi3141.github.io/discord-fake-avatar-decorations/public"
          }/giscus.css`}
          lang="en"
          loading="lazy"
        />
      </div>
    </main>
  );
}
