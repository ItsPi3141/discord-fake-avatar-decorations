import { Icons } from "./icons";
import "./modal.css";

export default function Modal(props) {
  return (
    <div
      className={`top-0 left-0 z-50 fixed flex justify-center items-center bg-black/80 w-screen h-screen select-none modal-container ${
        props.visible ? "modal-visible" : ""
      }`}
    >
      <div className="flex flex-col items-stretch bg-surface-high shadow-base-lower/60 shadow-sm border border-[#97979f1f] xs:rounded-xl w-screen xs:w-[420px] min-h-screen xs:min-h-[200px] overflow-hidden text-white modal-box">
        <div className={`p-4 relative flex flex-col grow gap-4 ${props.glow ? "glow-bg" : ""}`}>
          <button
            type="button"
            className="top-4 right-4 absolute opacity-50 hover:opacity-100 text-icon-tertiary transition-opacity [transition-duration:200ms]"
            onClick={props.onClose}
          >
            <Icons.close size="24px" />
          </button>
          <div className="flex flex-col gap-2">
            {props.title && (
              <div className="flex justify-center">
                <p className="font-semibold text-white/80 text-2xl text-center [letter-spacing:.02em]">{props.title}</p>
              </div>
            )}
            {props.subtitle && (
              <div className="flex justify-center">
                <p className="text-white/70 text-sm xs:text-base text-center">{props.subtitle}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-stretch">{props.children}</div>
          <div class="modal-spacer" />
          <div className="flex justify-end bg-surface-high mt-4 h-[38px]">
            {props.secondaryText && (
              <button type="button" className="px-6 py-2 rounded-lg text-white/70 text-sm hover:underline transition" onClick={props.onClose}>
                {props.secondaryText || "Cancel"}
              </button>
            )}
            <button type="button" className="px-6 py-2 text-sm button-primary" onClick={props.onClose}>
              {props.closeText || "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
