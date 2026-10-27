import { useEffect, useState } from "react";

const STEPS = [
  "Lecture de votre CV original…",
  "Analyse de l'offre cible…",
  "Reformulation des expériences…",
  "Réorganisation des sections…",
  "Contrôle anti-invention…",
  "Finalisation du document…",
];

export const CVVersionLoader = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cvversion-loader">
      <div className="cvversion-loader__ring">
        <div className="cvversion-loader__ring-inner" />
        <div className="cvversion-loader__ring-pulse" />
        <div className="cvversion-loader__ring-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="14 2 14 8 20 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="8"
              y1="13"
              x2="16"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="17"
              x2="13"
              y2="17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="cvversion-loader__title">Création de votre CV adapté</div>

      <div className="cvversion-loader__steps">
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

      <div className="cvversion-loader__hint">
        L'IA reformule sans jamais inventer. Cela peut prendre 10 à 20 secondes.
      </div>
    </div>
  );
};
