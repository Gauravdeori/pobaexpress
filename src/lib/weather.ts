import { createServerFn } from "@tanstack/react-start";

import {
  CLEAR,
  conditionsFrom,
  isHeavyRain,
  isNightIST,
  JONAI,
  type Conditions,
} from "./delivery-conditions";

/**
 * The current delivery conditions over Jonai.
 *
 * Answered on the server rather than from each browser for two reasons: one
 * cached call serves every customer instead of one per phone, and every
 * customer is quoted the same fee at the same moment — a surcharge that
 * depends on whose phone asked would be indefensible.
 *
 * Open-Meteo needs no key and no account. If it is slow, down, or says
 * something unexpected, the answer is fair weather: quoting a surcharge
 * because a forecast failed would be charging for a guess.
 */

const ENDPOINT =
  `https://api.open-meteo.com/v1/forecast?latitude=${JONAI.latitude}&longitude=${JONAI.longitude}` +
  `&current=precipitation,weather_code&timezone=Asia%2FKolkata`;

/** Rain does not change minute to minute, and the free tier is not infinite. */
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 4000;

let cached: { at: number; conditions: Conditions } | null = null;

export const getDeliveryConditions = createServerFn({ method: "GET" }).handler(
  async (): Promise<Conditions> => {
    // Night is a clock, not a forecast, so it is right even when the fetch
    // below fails — the half of the surcharge that never needs the network.
    const night = isNightIST();

    if (cached && Date.now() - cached.at < CACHE_MS) {
      return conditionsFrom(night, cached.conditions.heavyRain);
    }

    try {
      const response = await fetch(ENDPOINT, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Open-Meteo answered ${response.status}`);

      const body = (await response.json()) as {
        current?: { precipitation?: number; weather_code?: number };
      };
      const heavyRain = isHeavyRain(
        Number(body.current?.weather_code ?? 0),
        Number(body.current?.precipitation ?? 0),
      );

      const conditions = conditionsFrom(night, heavyRain);
      cached = { at: Date.now(), conditions };
      return conditions;
    } catch (error) {
      console.error("Could not read the weather", error);
      // Not cached: a failure should be retried on the next order, not held
      // for ten minutes.
      return conditionsFrom(night, CLEAR.heavyRain);
    }
  },
);
