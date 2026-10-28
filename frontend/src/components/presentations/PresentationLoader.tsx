import { useEffect, useState } from "react";

const STEPS = [
  "Analyse de votre CV…",
  "Lecture des exigences de l'offre…",
  "Sélection des expériences clés…",
  "Rédaction du speech…",
  "Relecture et adaptation du ton…",
];

export const PresentationLoader = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="offer-form-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="offer-form"
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Animation de l'anneau */}
        <div className="cvversion-loader__ring" style={{ marginBottom: 24 }}>
          <div className="cvversion-loader__ring-inner" />
          <div className="cvversion-loader__ring-pulse" />
          <div className="cvversion-loader__ring-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
        </div>

        <h2
          className="cvversion-loader__title"
          style={{ fontSize: 24, marginBottom: 24 }}
        >
          Rédaction de votre pitch
        </h2>

        <div
          className="cvversion-loader__steps"
          style={{ width: "100%", maxWidth: 300 }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`cvversion-loader__step ${
                i === stepIndex ? "cvversion-loader__step--active" : ""
              } ${i < stepIndex ? "cvversion-loader__step--done" : ""}`}
            >
              <span className="cvversion-loader__dot" />
              {step}
            </div>
          ))}
        </div>

        <div className="cvversion-loader__hint" style={{ marginTop: 24 }}>
          L'IA prépare un texte naturel et prêt à l'oral.
        </div>
      </div>
    </div>
  );
};
