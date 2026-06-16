"use client";

import { useEffect } from "react";
import { buildTabTitle } from "@/lib/game/decisions";
import type { GameRun } from "@/lib/game/types";

const DEFAULT_TITLE = "FounderHQ Capital";

export function useGameTabTitle(run: GameRun | null) {
  useEffect(() => {
    if (!run) {
      document.title = DEFAULT_TITLE;
      return;
    }

    document.title = buildTabTitle(run);
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [run]);
}