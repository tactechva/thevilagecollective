"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const TRACK = "/audio/white-petals.mp3";
const REMEMBER = "tvc.sound";
const LEVEL = 0.34; /* a room's worth, not a stereo's */

/*
  The garden's soundtrack.

  Two things shape this more than taste does.

  First: no browser will autoplay audio with sound. Chrome, Safari and Firefox all
  require a user gesture first, and a bare play() on mount is rejected. So it asks
  once, and if it is refused it waits for the first real interaction, any of a
  click, a key, a wheel or a touch, and starts then. In practice the music begins
  the moment the visitor does anything at all, which on a page whose whole point is
  scrolling is immediately.

  Second: sound the visitor cannot stop is hostile, so the control is always on
  screen while it plays, and the choice is remembered. Turn it off once and it
  stays off on every later visit, which matters because the alternative is being
  ambushed by the same song every time.

  It lives in layout.tsx, so it keeps playing across route changes rather than
  cutting off mid-bar when you open a business. It only STARTS on the home page.
*/
export function Music() {
  const here = usePathname();
  const reduce = useReducedMotion();
  const el = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [offered, setOffered] = useState(false); /* has it ever been audible */
  /*
    Someone who turned it off on a previous visit. They still need the control, or
    they cannot undo it: the old build skipped straight past start(), so `offered`
    stayed false, the button never rendered, and the only way back was clearing
    site data. A dead end I put there.
  */
  const [optedOut, setOptedOut] = useState(false);

  /* Ramp rather than jump. Landing on full volume mid-phrase is a jolt. */
  const rampTo = (target: number, ms: number, thenPause = false) => {
    const a = el.current;
    if (!a) return;
    if (fade.current) window.clearInterval(fade.current);
    const from = a.volume;
    const started = performance.now();
    fade.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - started) / ms);
      a.volume = from + (target - from) * t;
      if (t === 1) {
        window.clearInterval(fade.current!);
        fade.current = null;
        if (thenPause) a.pause();
      }
    }, 40);
  };

  const start = async () => {
    const a = el.current;
    if (!a || !a.paused) return true;
    a.volume = 0;
    try {
      await a.play();
      setPlaying(true);
      setOffered(true);
      rampTo(LEVEL, 2600);
      return true;
    } catch {
      return false; /* blocked: the caller arms a gesture instead */
    }
  };

  const stop = () => {
    setPlaying(false);
    rampTo(0, 620, true);
  };

  /* Only the home page begins it, and only if it was not turned off before. */
  useEffect(() => {
    if (here !== "/") return;
    if (window.localStorage.getItem(REMEMBER) === "off") {
      setOptedOut(true);
      return;
    }

    let done = false;
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

    /*
      Every gesture RETRIES, and the listeners only come off once one actually
      succeeds. They were `once` at first, which quietly failed: a wheel event does
      not grant user activation in Chrome, so scrolling consumed the one listener
      on a gesture that could not start playback, and the music never played at
      all. Wheel is still worth listening for, it just cannot be trusted alone.
    */
    const onGesture = () => {
      if (done) return;
      void start().then((ok) => {
        if (ok) release();
      });
    };
    const release = () => {
      done = true;
      events.forEach((e) => window.removeEventListener(e, onGesture));
    };

    void start().then((ok) => {
      if (ok) return;
      if (!done) {
        events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
      }
    });

    return release;
    /* `here` only, deliberately: re-running this on every render would re-arm */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here]);

  useEffect(() => {
    return () => {
      if (fade.current) window.clearInterval(fade.current);
    };
  }, []);

  const toggle = () => {
    if (playing) {
      window.localStorage.setItem(REMEMBER, "off");
      stop();
    } else {
      window.localStorage.setItem(REMEMBER, "on");
      setOptedOut(false);
      void start();
    }
  };

  return (
    <>
      <audio ref={el} src={TRACK} loop preload="auto" aria-hidden="true" />

      {/*
        Bottom right, not left: the dev overlay sits bottom left.

        Shown once the track has been audible, so it is never a dead switch on a
        first visit before anything has happened, AND shown to anyone who turned it
        off previously, so that choice is reversible.
      */}
      <AnimatePresence>
        {(offered || optedOut) && (
          <motion.button
            onClick={toggle}
            aria-label={playing ? "Turn the music off" : "Turn the music on"}
            aria-pressed={playing}
            className="group pointer-events-auto fixed right-6 bottom-6 z-[60] flex items-center gap-2.5 text-ink-faint transition-colors duration-500 hover:text-ink-soft sm:right-8 sm:bottom-8"
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* three reeds that sway while it plays and lie flat when it does not */}
            <span className="flex h-4 items-end gap-[3.5px]" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-[1.5px] bg-current"
                  animate={
                    playing && !reduce
                      ? { height: ["36%", "100%", "52%", "88%", "36%"] }
                      : { height: "22%" }
                  }
                  transition={
                    playing && !reduce
                      ? { duration: 2.1 + i * 0.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                  }
                />
              ))}
            </span>
            <span className="eyebrow text-[10px]">{playing ? "Sound on" : "Sound off"}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
