import { useCallback, useEffect, useRef, useState } from "react";

import FileUpload from "@/components/fileupload.jsx";
import { Icons } from "@/components/icons.jsx";
import Image from "@/components/image.jsx";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { imagesFromGif } from "@/ffmpeg/extractFrames.js";
import {
  ffmpeg,
  getMimeTypeFromArrayBuffer,
  initFfmpeg,
  setFfmpeg,
} from "@/ffmpeg/utils.js";

import { printErr, printMsg } from "@/utils/print.js";
import { clearData, getData, storeData } from "@/utils/dataHandler.js";
import { ffmpegTotalBytes } from "@/data/fileSizes.js";
import { downloadWithProgress } from "@/utils/download.js";

const isServer = typeof window === "undefined";

export default function GifExtractor() {
  const [loaded, setLoaded] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState("0%");

  const transferredFfmpeg = getData("ffmpeg");
  const ffmpegRef = useRef(isServer ? null : transferredFfmpeg || new FFmpeg());

  const load = useCallback(async () => {
    if (isServer) return;

    if (!transferredFfmpeg) {
      await initFfmpeg((e) => {
        setLoadPercentage(
          `${Math.round((e.received / ffmpegTotalBytes) * 100)}%`
        );
      });
    }

    setLoaded(true);

    if (!isServer) {
      const i = getData("image");
      if (i) setFile(i);
      clearData("image");
    }
  }, []);

  const [t, setT] = useState(false);
  useEffect(() => {
    if (t) return;
    setT(true);
    load();
  }, [load, t]);

  const [file, setFile] = useState(null);
  const [frames, setFrames] = useState(null);

  return (
    <>
      {loaded ? (
        <>
          <main className="flex flex-col items-center gap-2 px-8 py-12 w-screen h-screen overflow-auto overflow-x-hidden text-white discord-scrollbar">
            <p className="mb-8 text-3xl ginto">Gif Frame Extractor</p>

            {file == null ? (
              <>
                <button
                  className="flex justify-center items-center gap-1 mt-3 py-1.5 w-72 button-primary"
                  onClick={() => {
                    document.getElementById("upload-gif").click();
                  }}
                >
                  <input
                    type="file"
                    id="upload-gif"
                    className="hidden"
                    accept="image/png, image/gif, image/webp"
                    onChange={(e) => {
                      // @ts-ignore
                      const [file] = e.target.files;
                      if (file) {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                          setFile(reader.result);
                        };
                      }
                    }}
                  />
                  Upload a GIF
                </button>
                <p className="text-gray-300 text-sm">
                  You can also drag and drop a GIF file here
                </p>
              </>
            ) : (
              <>
                <div className="relative flex flex-col items-center">
                  <button
                    className="top-2 right-2 absolute bg-surface-high hover:bg-surface-higher shadow-sm p-2 rounded-lg text-critical text-lg transition-colors"
                    onClick={() => {
                      setFile(null);
                      setFrames(null);
                    }}
                  >
                    <Icons.delete />
                  </button>
                  <Image
                    src={file}
                    className="rounded-lg w-72 max-w-[calc(100vw-4rem)] sm:max-w-[32rem]"
                    draggable="false"
                  />
                  <button
                    className="flex justify-center items-center gap-1 mt-3 py-1.5 w-72 max-w-[calc(100vw-4rem)] button-primary"
                    onClick={async () => {
                      setFrames(await imagesFromGif(file));
                    }}
                  >
                    Extract frames
                  </button>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {frames &&
                    typeof frames === "object" &&
                    typeof frames.map === "function" &&
                    frames.map((frame, i) => (
                      <button
                        key={i}
                        className="flex justify-center items-center bg-base-lowest p-1 rounded-[5px] w-32 aspect-square"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = `data:image/png;base64,${frame}`;
                          a.download = `discord_fake_avatar_decorations_${Date.now()}.png`;
                          a.click();
                        }}
                      >
                        <img
                          alt=""
                          src={`data:image/png;base64,${frame}`}
                          className="rounded"
                          draggable={false}
                        />
                      </button>
                    ))}
                </div>
              </>
            )}
          </main>
          <FileUpload
            onUpload={async (e) => {
              const file = e.dataTransfer.files.item(0);
              if (
                !["image/png", "image/gif", "image/webp"].includes(file.type)
              ) {
                printErr(
                  `Expected image/png, image/gif, or image/webp. Got ${file.type}`
                );
                throw printErr("Invalid file type");
              }
              const ab = await file.arrayBuffer();
              if (
                !["image/png", "image/gif", "image/webp"].includes(
                  getMimeTypeFromArrayBuffer(ab)
                )
              ) {
                throw printErr("Invalid image file");
              }
              const reader = new FileReader();
              reader.readAsDataURL(new Blob([ab]));
              reader.onload = () => {
                setFile(reader.result);
              };
            }}
          />
        </>
      ) : (
        <main className="flex flex-col justify-center items-center p-8 w-full h-screen text-white">
          <p className="top-8 absolute mx-8 max-w-xl font-bold text-4xl text-center ginto">
            Discord
            <br />
            FAKE AVATAR DECORATIONS
            <br />
            <br />
            <span className="text-gray-300 text-3xl ginto">
              Gif Frame Extractor
            </span>
          </p>
          <div className="relative bg-surface-higher rounded-full w-[calc(100vw-3rem)] max-w-84 h-8 overflow-clip">
            <div
              style={{
                width: loadPercentage,
              }}
              className="bg-primary h-full"
            />
            <div className="top-0 right-0 bottom-0 left-0 absolute flex justify-center items-center">
              <p className="text-xl text-center ginto">{loadPercentage}</p>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
