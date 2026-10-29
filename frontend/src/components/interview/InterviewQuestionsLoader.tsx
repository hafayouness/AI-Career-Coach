import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";

const STEPS = [
  "Analyse de votre CV…",
  "Lecture des exigences du poste…",
  "Identification des compétences clés…",
  "Rédaction des questions RH…",
  "Rédaction des questions techniques…",
  "Préparation des exemples de réponses…",
];

export const InterviewQuestionsLoader = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="offer-form-overlay">
      <div
        className="offer-form"
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Anneau animé */}
        <div className="cvversion-loader__ring" style={{ marginBottom: 24 }}>
          <div className="cvversion-loader__ring-inner" />
          <div className="cvversion-loader__ring-pulse" />
          <div className="cvversion-loader__ring-icon">
            <HelpCircle size={24} />
          </div>
        </div>

        <h2
          className="cvversion-loader__title"
          style={{ fontSize: 24, marginBottom: 24, textAlign: "center" }}
        >
          Préparation de vos questions
        </h2>

        <div
          className="cvversion-loader__steps"
          style={{ width: "100%", maxWidth: 320 }}
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
          L'IA prépare des questions personnalisées basées sur votre profil.
        </div>
      </div>
    </div>
  );
};
