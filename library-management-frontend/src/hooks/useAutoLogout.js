import { useEffect } from "react";

const INACTIVITY_TIME = 30 * 60 * 1000;
let timeout;

const useAutoLogout = (logout) => {
  useEffect(() => {
    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        logout();
      }, INACTIVITY_TIME);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeout) clearTimeout(timeout);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
};

export default useAutoLogout;