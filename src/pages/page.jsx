import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";

import FileUpload from "@/components/fileupload.jsx";
import { Icons } from "@/components/icons.jsx";
import Image from "@/components/image.jsx";
import Modal from "@/components/modal.jsx";
import { LoadingCubes } from "@/components/spinner.jsx";
import Twemoji from "@/components/twemoji.jsx";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { addDecoration, cropToSquare } from "@/ffmpeg/processImage.js";
import {
  getMimeTypeFromArrayBuffer,
  initFfmpeg,
  setFfmpeg,
} from "@/ffmpeg/utils.js";

import { printErr } from "@/utils/print.js";
import { getData, storeData } from "@/utils/dataHandler.js";

import { decorationsData } from "@/data/decorations.js";
import { avatarsData } from "@/data/avatars.js";

import SearchBar from "@/components/searchbar.jsx";
import { Svg } from "@/components/svg.jsx";
import { useLocation } from "preact-iso";
import { NeutralButton } from "@/components/button";
import { Fragment } from "preact/jsx-runtime";
import { createContext } from "preact";

const baseImgUrl = import.meta.env.VITE_BASE_IMAGE_URL || "";

const isServer = typeof window === "undefined";

let loadingPromise = null;

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  const [unsupported, setUnsupported] = useState("");

  const transferredFfmpeg = getData("ffmpeg");
  const ffmpegRef = useRef(isServer ? null : transferredFfmpeg || new FFmpeg());

  const ensureLoaded = useCallback(async () => {
    if (loaded) return;
    if (loadingPromise != null) {
      await loadingPromise;
      return;
    }
    throw new Error("FFmpeg initialization not queued.");
  }, []);

  const load = useCallback(async () => {
    if (isServer) return;

    if (typeof WebAssembly === "undefined") {
      setUnsupported("Your browser does not support WebAssembly.");
    }

    if (!transferredFfmpeg) {
      setFfmpeg(ffmpegRef.current);

      loadingPromise = initFfmpeg();
      await loadingPromise;
    }

    setLoaded(true);
  }, []);

  const [t, setT] = useState(false);
  useEffect(() => {
    if (t) return;
    setT(true);
    load();
  }, [load, t]);

  return (
    <>
      <App ensureLoaded={ensureLoaded} />
      <UnsupportedModal unsupportedMsg={unsupported} />
    </>
  );
}

const UnsupportedModal = ({ unsupportedMsg }) =>
  unsupportedMsg && (
    <Modal visible={true} hideActions={true}>
      <div className="flex flex-col justify-between items-stretch bg-critical/20 p-4 border-2 border-critical border-dashed rounded-xl grow">
        <div>
          <p className="text-2xl text-center ginto">Error</p>
          <p className="text-center">{unsupportedMsg}</p>
        </div>
        <NeutralButton
          onClick={() => {
            window.open(
              "https://github.com/ItsPi3141/discord-fake-avatar-decorations/issues"
            );
          }}
        >
          <Icons.bug />
          Report a bug
        </NeutralButton>
      </div>
    </Modal>
  );

const CurrentData = createContext(null);

const App = ({ ensureLoaded }) => {
  // @ts-ignore
  const previewAvatar = useCallback(async (url) => {
    if (isServer) return;
    await ensureLoaded();
    setAvUrl("loading");
    const res = await cropToSquare(url).catch((reason) => printErr(reason));
    if (!res) return setAvUrl(null);
    setAvUrl(res);
  });

  // @ts-ignore
  const createAvatar = useCallback(async (url, deco) => {
    if (isServer) return;
    await ensureLoaded();
    addDecoration(url, deco === "" ? "" : `${baseImgUrl}${deco}`)
      .then((res) => {
        if (!res) {
          setFinishedAv(null);
          setGenerationFailed(true);
          return;
        }
        setFinishedAv(res);
        setIsGeneratingAv(false);
      })
      .catch((reason) => {
        setGenerationFailed(true);
        setIsGeneratingAv(false);
        printErr(reason);
      });
  });

  const [avatarName, setAvatarName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [decoUrl, setDecoUrl] = useState("");
  const [avUrl, setAvUrl] = useState("");

  const [finishedAv, setFinishedAv] = useState("");
  const [isGeneratingAv, setIsGeneratingAv] = useState(false);
  const [generationFailed, setGenerationFailed] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  const [shared, setShared] = useState(false);

  const [avatarSearch, setAvatarSearch] = useState("");
  const [decoSearch, setDecoSearch] = useState("");

  const router = useLocation();

  // @ts-ignore
  const getBannerImage = useCallback(() => {
    switch (new Date().getMonth() + 1) {
      case 2:
        return `url(${baseImgUrl}/banners/hearts.png) right top / contain no-repeat, linear-gradient(78.98deg, rgba(221, 98, 98, 1), rgba(171, 12, 152, 1))`;
      case 12:
        return `url(${baseImgUrl}/wallpaper/winter.jpg) center / cover no-repeat`;
      default:
        return "none";
    }
  }, []);

  const clearSelectedAvatar = useCallback(() => {
    for (const el of document.querySelectorAll(
      "button.avatar-preset.border-primary"
    )) {
      el.classList.remove("border-primary");
    }
  }, []);

  return (
    <CurrentData.Provider
      value={{
        avatarsData,
        avatarSearch,
        setAvatarName,
        setAvUrl,

        decorationsData,
        decoSearch,
        setName,
        setDescription,
        setDecoUrl,
        name,
      }}
    >
      <main className="flex flex-col items-center w-screen h-screen overflow-auto text-white discord-scrollbar">
        <div className="relative bg-primary sm:mt-8 sm:rounded-3xl w-full sm:w-[calc(100%-6rem)] min-h-72 overflow-hidden select-none">
          <div
            className="top-0 right-0 bottom-0 left-0 z-0 absolute w-full h-full object-bottom pointer-events-none"
            style={{
              background: getBannerImage(),
            }}
          />
          <div className="top-0 right-0 bottom-0 left-0 z-10 absolute flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 text-center">
            <h1 className="font-bold text-3xl md:text-5xl ginto">Discord</h1>
            <h1 className="mb-4 text-2xl md:text-4xl capitalize ginto">
              Fake Avatar Decorations
            </h1>
            <h2 className="text-sm sm:text-base">
              Create profile pictures with avatar decorations so you can use
              them in Discord for free without spending money
            </h2>
          </div>
        </div>
        <div className="flex md:flex-row flex-col items-center md:items-start gap-8 px-8 py-12 w-full max-w-[900px]">
          {/* SETTINGS */}
          <div
            id="settings"
            className="block w-full md:w-auto select-none grow"
          >
            {/* UPLOAD AVATAR */}
            <p className="my-2 font-semibold text-gray-300 text-sm scale-y-90 [letter-spacing:.05em]">
              AVATAR
            </p>
            <div className="flex sm:flex-row flex-col sm:items-center gap-3">
              <button
                className="px-4 py-1.5 button-primary"
                onClick={() => {
                  document.getElementById("upload-avatar").click();
                }}
              >
                <input
                  type="file"
                  id="upload-avatar"
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={(e) => {
                    // @ts-ignore
                    const [file] = e.target.files;
                    if (file) {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        previewAvatar(reader.result);
                        clearSelectedAvatar();
                      };
                    }
                  }}
                />
                Upload image
              </button>
              <p className="sm:text-left text-center">or</p>
              <input
                type="text"
                className="text-input grow"
                placeholder="Enter image URL..."
                onChange={async (e) => {
                  setAvatarName("");
                  // @ts-ignore
                  const res = await fetch(e.target.value);
                  if (res.status < 200 || res.status >= 400)
                    return setAvUrl(null);
                  const blob = await res.blob();
                  if (
                    ![
                      "image/png",
                      "image/jpeg",
                      "image/gif",
                      "image/webp",
                    ].includes(blob.type)
                  )
                    return setAvUrl(null);
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onload = () => {
                    previewAvatar(reader.result);
                    clearSelectedAvatar();
                  };
                }}
              />
            </div>
            <p className="mt-4 mb-2">
              You can also pick from one of these avatars below
            </p>
            <SearchBar
              placeholder={"Search avatars..."}
              onValueChanged={setAvatarSearch}
            />
            {/* SELECT AVATAR */}
            <div className="flex flex-col gap-8 mt-1 py-1 h-[280px] overflow-auto discord-scrollbar">
              <AvatarList />
            </div>
            <hr className="border-b border-border-faint/10" />

            {/* SELECT DECORATION */}
            <p className="my-2 font-semibold text-gray-300 text-sm scale-y-90 [letter-spacing:.05em]">
              AVATAR DECORATION
            </p>
            <SearchBar
              placeholder={"Search decorations..."}
              onValueChanged={setDecoSearch}
            />

            <DecorationsTabs />
          </div>

          <div className="flex flex-col items-center gap-8">
            {/* PROFILE PREVIEW */}
            <div
              id="profile-preview"
              className="relative bg-surface-overlay shadow-lg rounded-lg w-[300px] overflow-hidden select-none"
            >
              <div className="bg-primary h-[105px]" />
              <div className="top-[61px] left-[16px] absolute bg-surface-overlay p-[6px] rounded-full w-[92px] h-[92px] select-none">
                <div className="relative rounded-full w-[80px] h-[80px] overflow-hidden">
                  {avUrl === "loading" ? (
                    <div className="top-[24px] left-[24px] absolute">
                      <LoadingCubes />
                    </div>
                  ) : (
                    <>
                      <Image
                        id="avatar"
                        src={avUrl || `${baseImgUrl}/avatars/blue.png`}
                        className={
                          "absolute top-[calc(80px*0.09)] left-[calc(80px*0.09)] w-[calc(80px*0.82)] h-[calc(80px*0.82)] rounded-full"
                        }
                        draggable={false}
                      />
                      <Image
                        id="decoration"
                        src={decoUrl}
                        className="top-0 left-0 absolute"
                        draggable={false}
                      />
                    </>
                  )}
                </div>
                <div className="right-[-4px] bottom-[-4px] absolute bg-[#229f56] border-[5px] border-surface-overlay rounded-full w-7 h-7" />
              </div>
              <div className="bg-surface-overlay mt-[35px] p-4 rounded-lg w-[calc(100%)] *:w-full">
                <p className="font-semibold text-xl [letter-spacing:.02em]">
                  {name || "Display Name"}
                </p>
                <p className="mb-3 text-sm">{avatarName || "username"}</p>
                <p className="text-sm">
                  {description ||
                    "This is an example profile so that you can see what the profile picture would actually look like on Discord."}
                </p>
                <NeutralButton
                  onClick={() => {
                    setFinishedAv("");
                    setIsGeneratingAv(true);
                    setGenerationFailed(false);
                    setDownloadModalVisible(true);
                    createAvatar(
                      avUrl || `${baseImgUrl}/avatars/blue.png`,
                      decoUrl
                    );
                  }}
                >
                  <Icons.image />
                  Save image
                </NeutralButton>
              </div>
            </div>
            {/* Message preview */}
            <div className="bg-base-lower py-4 border border-border-faint rounded-lg w-[300px] cursor-default select-none">
              {[
                {
                  styled: false,
                  groupStart: true,
                  text: "Look at me I'm a beautiful butterfly",
                },
                {
                  styled: false,
                  groupStart: false,
                  text: (
                    <>
                      Fluttering in the moonlight <Twemoji emoji={"1f31d"} />
                    </>
                  ),
                },
                {
                  styled: false,
                  groupStart: false,
                  text: "Waiting for the day when",
                },
                {
                  styled: false,
                  groupStart: false,
                  text: "I get an avatar decoration",
                },
                {
                  styled: true,
                  groupStart: true,
                  text: (
                    <>
                      {decoUrl ? (
                        <>
                          Yay! Here it is! <Twemoji emoji={"1f389"} />
                        </>
                      ) : (
                        <>
                          Hmm... I still don't see it{" "}
                          <Twemoji emoji={"1f914"} />
                        </>
                      )}
                    </>
                  ),
                },
              ].map((m, i) => {
                return (
                  <div
                    className="flex items-center gap-4 hover:bg-base-lowest px-4 py-0.5"
                    style={{
                      marginTop: m.groupStart && i !== 0 ? "17px" : "0",
                    }}
                    key={i}
                  >
                    {m.groupStart &&
                      (avUrl === "loading" ? (
                        <div className="relative w-10 h-10 scale-75 shrink-0">
                          <LoadingCubes />
                        </div>
                      ) : (
                        <>
                          {m.styled ? (
                            <div className="relative rounded-full w-10 h-10 overflow-hidden shrink-0">
                              <Image
                                src={avUrl || `${baseImgUrl}/avatars/blue.png`}
                                draggable={false}
                                width={32.8}
                                height={32.8}
                                className="top-[3.6px] left-[3.6px] absolute rounded-full"
                              />
                              {decoUrl && (
                                <Image
                                  src={decoUrl}
                                  draggable={false}
                                  width={40}
                                  height={40}
                                  className="top-0 left-0 absolute"
                                />
                              )}
                            </div>
                          ) : (
                            <Image
                              src={avUrl || `${baseImgUrl}/avatars/blue.png`}
                              draggable={false}
                              className="rounded-full w-10 h-10 shrink-0"
                            />
                          )}
                        </>
                      ))}
                    <div className="flex flex-col overflow-hidden shrink">
                      {m.groupStart && (
                        <p className="flex items-center gap-2 max-w-[250px] h-fit font-medium text-base">
                          <span className="overflow-hidden text-ellipsis text-nowrap">
                            {name || "Display Name"}
                          </span>
                          <span className="h-4 text-text-muted text-xs text-nowrap">
                            Today at{" "}
                            {[
                              new Date().getHours() % 12,
                              new Date().getMinutes(),
                            ]
                              .map((e) => e.toString().padStart(2, "0"))
                              .join(":") +
                              (new Date().getHours() >= 12 ? " PM" : " AM")}
                          </span>
                        </p>
                      )}

                      <p
                        style={{
                          marginLeft: m.groupStart ? "0" : "56px",
                          lineHeight: "22px",
                        }}
                      >
                        {m.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* pls support */}
            <div className="flex flex-col justify-start items-stretch p-4 rounded-lg w-full text-center select-none highlight">
              <p>
                Help support the project <Twemoji emoji="1f64f" />
              </p>
              <NeutralButton
                onClick={() => {
                  window.open(
                    "https://github.com/ItsPi3141/discord-fake-avatar-decorations"
                  );
                }}
              >
                <Icons.star />
                Star on GitHub
              </NeutralButton>
              <NeutralButton
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShared(true);
                  setTimeout(() => {
                    setShared(false);
                  }, 1500);
                }}
              >
                <Icons.link />
                {shared ? "Copied!" : "Share the website"}
              </NeutralButton>
              <NeutralButton
                onClick={() => {
                  window.open(
                    "https://github.com/ItsPi3141/discord-fake-avatar-decorations/issues/new?template=bug_report.yml"
                  );
                }}
              >
                <Icons.bug />
                Report a bug
              </NeutralButton>
              <NeutralButton
                onClick={() => {
                  window.open(
                    "https://github.com/ItsPi3141/discord-fake-avatar-decorations/issues/new?template=feature_request.yml"
                  );
                }}
              >
                <Icons.inbox />
                Suggest a feature
              </NeutralButton>
              <NeutralButton
                onClick={() => {
                  window.open("/discuss");
                }}
              >
                <Icons.forum />
                Discussions
              </NeutralButton>
            </div>

            {/* Links */}
            <div className="flex flex-col justify-start items-stretch rounded-lg w-full font-medium select-none">
              <p className="font-bold">Links</p>
              <a
                className="flex justify-start items-center gap-2 mt-3 p-2 button-outline"
                href={"/gif-extractor"}
                target="_blank"
                rel="noreferrer"
              >
                <span className="place-items-center w-6">
                  <Icons.gif size="18px" />
                </span>
                Extract still image from GIF
                <span className="grow" />
                <span className="rotate-45">
                  <Icons.up size="16px" />
                </span>
              </a>
              <a
                className="flex justify-start items-center gap-2 mt-3 p-2 button-outline"
                href={
                  "https://github.com/ItsPi3141/discord-fake-avatar-decorations"
                }
                target="_blank"
                rel="noreferrer"
              >
                <span className="place-items-center w-6">
                  <Icons.github size="24px" />
                </span>
                Source code
                <span className="grow" />
                <span className="rotate-45">
                  <Icons.up size="16px" />
                </span>
              </a>
            </div>
          </div>
        </div>
        <p className="mb-4 text-text-muted text-sm text-center">
          Website made by{" "}
          <a
            href={"https://github.com/ItsPi3141"}
            className="link"
            target="_blank"
            rel="noreferrer"
          >
            ItsPi3141
          </a>
          <br />
          This project is open-source! View{" "}
          <a
            href={
              "https://github.com/ItsPi3141/discord-fake-avatar-decorations"
            }
            className="link"
            target="_blank"
            rel="noreferrer"
          >
            source code
          </a>{" "}
          on GitHub.
          <br />
          This site is NOT affiliated with Discord Inc. in any way. All images
          and assets belong to Discord Inc.
          <br />
          Discord Character avatars were created by Bred and Jace. View the
          collection on{" "}
          <a
            href={
              "https://www.figma.com/community/file/1316822758717784787/ultimate-discord-library"
            }
            className="link"
            target="_blank"
            rel="noreferrer"
          >
            Figma
          </a>
        </p>
      </main>
      <Modal
        title={"Save Decorated Avatar"}
        subtitle={
          isGeneratingAv
            ? "Please wait while the image is being generated."
            : "You can save the image below. You may need to extract a still frame from the image if you do not have an active Nitro subscription."
        }
        visible={downloadModalVisible}
        onClose={() => {
          setDownloadModalVisible(false);
        }}
      >
        {isGeneratingAv ? (
          <div className="flex flex-col justify-center items-center gap-4 grow">
            <LoadingCubes />
            <p>Creating image...</p>
          </div>
        ) : generationFailed ? (
          <div className="flex flex-col justify-center items-center gap-4 grow">
            <p className="text-red-400 text-center">
              Failed to generate image
              <br />
              Please try again.
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center gap-4 grow">
            <Image
              src={finishedAv}
              draggable={false}
              width={128}
              height={128}
            />
            <div className="flex flex-col w-full">
              <div className="flex flex-col items-center gap-2 mt-3 *:mt-0 w-full *:w-72">
                <NeutralButton
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = finishedAv;
                    a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
                    a.click();
                  }}
                >
                  <Icons.download />
                  Save
                </NeutralButton>
                <NeutralButton
                  onClick={() => {
                    if (isServer) return;
                    storeData("image", finishedAv);
                    router.route("/gif-extractor");
                  }}
                >
                  <Icons.image />
                  Extract still image
                </NeutralButton>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <FileUpload
        onUpload={async (e) => {
          const file = e.dataTransfer.files.item(0);
          if (
            !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
              file.type
            )
          ) {
            printErr(
              `Expected image/png, image/jpeg, image/gif, or image/webp. Got ${file.type}`
            );
            throw printErr("Invalid file type");
          }
          const ab = await file.arrayBuffer();
          if (getMimeTypeFromArrayBuffer(ab) == null) {
            throw printErr("Invalid image file");
          }
          const reader = new FileReader();
          reader.readAsDataURL(new Blob([ab]));
          reader.onload = () => {
            previewAvatar(reader.result);
            clearSelectedAvatar();
          };
        }}
      />
    </CurrentData.Provider>
  );
};

export const NoSearchResults = ({ thing }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 text-text-muted grow">
      <Svg.NoSearchResults size="140" />
      <p className="text-center">No {thing} found</p>
    </div>
  );
};

const AvatarList = () => {
  const { avatarsData, avatarSearch, setAvatarName, setAvUrl } =
    useContext(CurrentData);

  const getAvatars = useCallback(() => {
    if (isServer) return [];
    return avatarsData.filter((avatar) =>
      avatar.n.toLowerCase().includes(avatarSearch.toLowerCase())
    );
  }, [avatarsData, avatarSearch]);

  const onSelectAvatar = useCallback((event, name, file) => {
    setAvatarName(name.toLowerCase());
    setAvUrl(`${baseImgUrl}/avatars/${file}`);
    for (const el of document.querySelectorAll(
      ".avatar-preset.border-primary"
    )) {
      el.classList.remove("border-primary");
    }
    // @ts-ignore
    event.target.classList.add("border-primary");
  }, []);

  return (
    <>
      {getAvatars().length === 0 && !isServer ? (
        <NoSearchResults thing="avatars" />
      ) : (
        <div className="gap-3 grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 min-[600px]:grid-cols-6 min-[720px]:grid-cols-7 md:grid-cols-5 translate-z-1">
          {getAvatars().map((avatar) => {
            return (
              <button
                key={avatar.n}
                className="avatar-preset button-tile"
                onClick={(e) => {
                  onSelectAvatar(e, avatar.n, avatar.f);
                }}
                aria-label={avatar.n}
              >
                <Image
                  src={`/avatars/${avatar.f}`}
                  className="rounded-full pointer-events-none"
                />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

const DecorationsTabs = () => {
  const { decorationsData } = useContext(CurrentData);

  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <div className="flex gap-3 my-2">
        {decorationsData.map(({ name, icon }, index) => {
          const Icon = Icons[icon];
          return (
            <button
              key={name}
              className={`${
                activeTab === index ? "bg-surface-high" : "bg-transparent"
              } px-4 py-1.5 font-semibold text-sm hover:bg-surface-higher active:bg-surface-high rounded-lg flex items-center gap-1 transition-colors`}
              onClick={() => setActiveTab(index)}
              aria-label={name}
            >
              <Icon width="16px" height="16px" />
              {name}
            </button>
          );
        })}
      </div>
      <div className="relative h-[532px] overflow-clip">
        {decorationsData.map(({ name, data }, index) => (
          <DecorationsList
            key={name}
            {...{
              decorationsList: data,
            }}
            style={{
              // display: activeTab === index ? "block" : "none",
              transform:
                activeTab < index
                  ? "translateX(100%)"
                  : activeTab > index
                  ? "translateX(-100%)"
                  : "translateX(0)",
              zIndex: activeTab === index ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(.46,.94,.1,.99)",
            }}
            className="top-0 right-0 bottom-0 left-0 absolute transition-transform translate-z-1 duration-400"
          />
        ))}
      </div>
    </>
  );
};

const DecorationsList = ({ decorationsList, style, className }) => {
  const { decoSearch, setName, setDescription, setDecoUrl } =
    useContext(CurrentData);

  const getDecorations = useCallback(() => {
    if (isServer) return [];
    return decorationsList
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
  }, [decorationsList, decoSearch]);

  const onSelectDecor = useCallback((event, name, description, file) => {
    setName(name);
    setDescription(description);
    setDecoUrl(`/decorations/${file}.png`);

    for (const el of document.querySelectorAll(".decor.border-primary")) {
      el.classList.remove("border-primary");
    }
    event.target.classList.add("border-primary");
  }, []);

  return (
    <div
      className={`mt-1 py-1 overflow-auto discord-scrollbar ${className}`}
      style={style}
    >
      {getDecorations().length === 0 && !isServer ? (
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
                      onClick={(e) =>
                        onSelectDecor(e, decor.n, decor.d, decor.f)
                      }
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
                  <Svg.Nitro className="my-2" />
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

  return (
    <Image
      key={name}
      src={
        isHovered
          ? `/decorations/${fileName}.png`
          : `/mdecorations/${fileName}.webp`
      }
      className="button-tile decor"
      draggable={false}
      onClick={onClick}
      onMouseOver={() => {
        setTimer(
          setInterval(() => {
            setIsHovered(true);
            try {
              clearTimeout(timer);
            } catch (e) {}
          }, 100)
        );
      }}
      onMouseOut={() => {
        setIsHovered(false);
        try {
          clearTimeout(timer);
        } catch (e) {}
      }}
    />
  );
};
