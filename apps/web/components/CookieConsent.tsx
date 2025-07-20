"use client";
import { useEffect, useState } from "react";

export type ConsentStatus = "granted" | "denied";

export default function CookieConsent({
  onConsent,
}: {
  onConsent: (status: ConsentStatus) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
    else if (consent === "granted" || consent === "denied")
      onConsent(consent as ConsentStatus);
  }, [onConsent]);

  const accept = () => {
    localStorage.setItem("cookie_consent", "granted");
    setVisible(false);
    onConsent("granted");
  };

  const refuse = () => {
    localStorage.setItem("cookie_consent", "denied");
    setVisible(false);
    onConsent("denied");
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#222",
        color: "#fff",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      {!showCustomize ? (
        <>
          Ce site utilise Google Analytics pour améliorer l&apos;expérience
          utilisateur.
          <button
            id="cookie-accept"
            onClick={accept}
            style={{
              marginLeft: "1rem",
              background: "#fff",
              color: "#222",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Accepter
          </button>
          <button
            id="cookie-refuse"
            onClick={refuse}
            style={{
              marginLeft: "1rem",
              background: "#fff",
              color: "#222",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Refuser
          </button>
          <button
            id="cookie-customize"
            onClick={() => setShowCustomize(true)}
            style={{
              marginLeft: "1rem",
              background: "#fff",
              color: "#222",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Personnaliser
          </button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <strong>Personnalisation des cookies</strong>
            <br />
            Google Analytics (statistiques anonymes) :{" "}
            <span>Obligatoire pour l&apos;amélioration du service</span>
          </div>
          <button
            id="cookie-customize-accept"
            onClick={accept}
            style={{
              marginRight: "1rem",
              background: "#fff",
              color: "#222",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Accepter
          </button>
          <button
            id="cookie-customize-refuse"
            onClick={refuse}
            style={{
              background: "#fff",
              color: "#222",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Refuser
          </button>
        </>
      )}
    </div>
  );
}
