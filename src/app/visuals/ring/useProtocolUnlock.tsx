import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ProtocolUnlock } from "./Moments";
import { seen } from "../../xp";

/** Shows "Protocol ready" the first time a member opens a protocol screen. Returns the overlay. */
export const useProtocolUnlock = (id: string, title: string, enabled = true) => {
  const [show, setShow] = useState(() => enabled && !seen.get()[`protocol:${id}`]);
  const close = () => {
    seen.set(`protocol:${id}`, 1);
    setShow(false);
  };
  return <AnimatePresence>{show && <ProtocolUnlock key={id} title={title} onDone={close} />}</AnimatePresence>;
};
