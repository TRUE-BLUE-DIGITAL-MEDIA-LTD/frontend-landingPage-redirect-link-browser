import { useEffect, type ReactNode } from "react";
import { useEscKey } from "../../hooks/useKeyboard";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

function PopupLayout({ children, onClose }: LayoutProps) {
  useEscKey(() => {
    onClose();
    document.body.style.overflow = "auto";
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);
  return (
    <div
      className={`fixed flex top-0 bottom-0 right-0 left-0 items-center justify-center m-auto z-50`}
    >
      {children}
      <footer
        onClick={() => {
          onClose();
        }}
        className="top-0 bottom-0 w-screen h-screen right-0 left-0 
    bg-black/50 backdrop-blur-md fixed  m-auto -z-10"
      ></footer>
    </div>
  );
}

export default PopupLayout;
