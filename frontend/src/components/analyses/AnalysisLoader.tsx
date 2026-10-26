import { useEffect, useState } from "react";

const STEPS = [
  "Lecture du CV…",
  "Comparaison des compétences…",
  "Analyse des exigences…",
  "Calcul du score…",
  "Génération des recommandations…",
];

export const AnalysisLoader = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="analysis-loader">
      <div className="analysis-loader__ring">
        <div className="analysis-loader__ring-inner" />
        <div className="analysis-loader__ring-pulse" />
      </div>

      <div className="analysis-loader__title">Analyse en cours</div>

      <div className="analysis-loader__steps">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`analysis-loader__step ${
              i === stepIndex ? "analysis-loader__step--active" : ""
            } ${i < stepIndex ? "analysis-loader__step--done" : ""}`}
          >
            <span className="analysis-loader__dot" />
            {step}
          </div>
        ))}
      </div>

      <div className="analysis-loader__hint">
        Cela prend généralement 5 à 10 secondes.
      </div>
    </div>
  );
};
