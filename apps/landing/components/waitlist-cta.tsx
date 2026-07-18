"use client";

import { useState } from "react";

export function WaitlistCta() {
  const [interested, setInterested] = useState(false);
  const rememberInterest = () => {
    window.localStorage.setItem("aurelis-early-interest", "true");
    setInterested(true);
  };
  if (interested)
    return (
      <p className="text-cream mt-10 font-serif text-3xl" role="status">
        Nos vemos antes del primer acorde.
      </p>
    );
  return (
    <button type="button" onClick={rememberInterest} className="cta-button">
      Quiero conocer Aurelis
    </button>
  );
}
