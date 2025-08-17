import { useCallback, useState } from "preact/hooks";
import Image from "./image";
import { NoSearchResults } from "@/pages/page";
import { Fragment } from "preact/jsx-runtime";

const isServer = typeof window === "undefined";

export const DecorationsList = ({
  decoData,
  decoSearch,
  setName,
  setDescription,
  setDecoUrl,
  style,
  className,
}) => {
  const getDecorations = useCallback(() => {
    if (isServer) return [];
    return decoData
      .map((c) => ({
        ...c,
        i: c.i.filter(
          (e) =>
            e.n.toLowerCase().includes(decoSearch.toLowerCase()) ||
            e.d.toLowerCase().includes(decoSearch.toLowerCase()) ||
            c.n.toLowerCase().includes(decoSearch.toLowerCase()) ||
            c.d.toLowerCase().includes(decoSearch.toLowerCase())
        ),
      }))
      .filter((category) => category.i.length > 0);
  }, [decoData, decoSearch]);

  return (
    <div
      className={`mt-1 py-1 overflow-auto discord-scrollbar ${className}`}
      style={style}
    >
      {getDecorations().length === 0 ? (
        <NoSearchResults thing="decorations" />
      ) : (
        getDecorations().map((category) => {
          return (
            <div
              key={
                typeof category.b.i === "string"
                  ? category.b.i
                  : category.b.i.length > 0
                  ? category.b.i[0].url
                  : category.n
              }
              className="mt-8 first:mt-0"
            >
              <DecorationsCategoryBanner category={category} />

              <div className="gap-3 grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 min-[600px]:grid-cols-6 min-[720px]:grid-cols-7 md:grid-cols-5 w-full">
                {category.i.map((decor) => {
                  return (
                    <Decoration
                      name={decor.n}
                      fileName={decor.f}
                      onClick={(e) => {
                        setName(decor.n);
                        setDescription(decor.d);
                        setDecoUrl(`/decorations/${decor.f}.png`);
                        for (const el of document.querySelectorAll(
                          "button.decor.border-primary"
                        )) {
                          el.classList.remove("border-primary");
                        }
                        // @ts-ignore
                        e.target.classList.add("border-primary");
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const DecorationsCategoryBanner = ({ category }) => {
  return (
    <div className="relative justify-center items-center grid grid-cols-1 grid-rows-1 bg-black mb-4 rounded-2xl w-full h-28 overflow-hidden">
      {typeof category.b.i !== "string" ? (
        <>
          <div
            className="top-0 right-0 bottom-0 left-0 absolute"
            style={{
              background: category.b.bg || "#000",
            }}
          />
          {category.b.i.map((e, i) => (
            <Image
              key={e.url}
              className={"object-cover bottom-0 absolute"}
              src={`/banners/${e.url}${e.url.includes(".") ? "" : ".webp"}`}
              alt={""}
              draggable={false}
              height={0}
              width={0}
              style={{
                height: e.height || "auto",
                width: e.width || (e.height ? "auto" : "100%"),
                left: e.align.includes("left") || e.align === "center" ? 0 : "",
                right:
                  e.align.includes("right") || e.align === "center" ? 0 : "",
                top: e.align.includes("top") ? 0 : "",
                bottom: e.align.includes("bottom") ? 0 : "",
                objectPosition: e.align,
                opacity: e.opacity || 1,
                transform: e.transform || "",
              }}
            />
          ))}
        </>
      ) : (
        <Image
          className="object-cover [grid-column:1/1] [grid-row:1/1]"
          src={`/banners/${category.b.i}${
            category.b.i.includes(".") ? "" : ".webp"
          }`}
          alt={""}
          draggable={false}
          height={0}
          width={0}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            objectPosition: category.b.bgPos || "",
          }}
        />
      )}
      <div className="relative flex flex-col justify-center items-center p-4 h-full [grid-column:1/1] [grid-row:1/1]">
        {category.b.t ? (
          category.b.t === "" ? (
            <div
              style={{
                height: `${category.b.h || 48}px`,
                width: "100%",
              }}
            />
          ) : (
            <Image
              src={`/bannertext/${category.b.t}${
                category.b.t.includes(".") ? "" : ".webp"
              }`}
              alt={category.n}
              draggable={false}
              height={0}
              width={0}
              style={{
                height: `${category.b.h || 48}px`,
                width: "auto",
              }}
            />
          )
        ) : (
          <>
            {!category.hideTitle && (
              <p
                className="px-4 text-3xl text-center ginto"
                style={{
                  color: category.darkText || false ? "#000" : "#fff",
                }}
              >
                {category.n.toLowerCase().includes("nitro") ? (
                  <>
                    <span className="text-4xl uppercase nitro-font">
                      {category.n}
                    </span>
                  </>
                ) : (
                  category.n
                )}
              </p>
            )}
          </>
        )}
        <p
          className="w-[232px] xs:w-full font-medium text-sm text-center [line-height:1]"
          style={{
            color: category.darkText || false ? "#000" : "#fff",
            marginTop: category.descTopM || "",
          }}
        >
          {category.d.includes("\n")
            ? category.d.split("\n").map((e, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {e}
                </Fragment>
              ))
            : category.d}
        </p>
        {category.badge && (
          <p className="top-2 right-2 absolute bg-white m-0 px-2 py-0 rounded-full font-semibold text-black text-xs [letter-spacing:0]">
            {category.badge}
          </p>
        )}
      </div>
    </div>
  );
};

const Decoration = ({ name, fileName, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [timer, setTimer] = useState(0);

  const [shouldAnimate, setShouldAnimate] = useState(false);

  return (
    <button
      key={name}
      type="button"
      className="button-tile decor"
      onClick={onClick}
      onMouseOver={() => {
        setTimer(
          setInterval(() => {
            setIsHovered(true);
            if (!shouldAnimate) setShouldAnimate(true);
            try {
              clearTimeout(timer);
            } catch (e) {}
          }, 100)
        );
      }}
      onMouseOut={() => {
        try {
          clearTimeout(timer);
        } catch (e) {}
        setIsHovered(false);
      }}
    >
      <Image
        src={`/mdecorations/${fileName}.webp`}
        className="pointer-events-none a"
        style={{
          display: isHovered ? "none" : "",
        }}
      />
      <Image
        src={
          shouldAnimate
            ? `/decorations/${fileName}.png`
            : `/mdecorations/${fileName}.webp`
        }
        className="pointer-events-none b"
        style={{
          display: isHovered ? "block" : "",
        }}
      />
    </button>
  );
};
