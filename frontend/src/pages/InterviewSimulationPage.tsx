import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Send,
  Play,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useCVs } from "../hooks/useCVs";
import { useJobOffers } from "../hooks/useJobOffers";
import {
  useStartInterview,
  useAnswerInterview,
  useFinishInterview,
} from "../hooks/useInterviewSimulation";
import type { InterviewMessage } from "../types";
import { InterviewSimulationLoader } from "../components/interview/InterviewSimulationLoader";

import { Button, Spinner, Alert } from "../components/ui";

export const InterviewSimulationPage = () => {
  const { data: cvs } = useCVs();
  const { data: offers } = useJobOffers();

  const startSession = useStartInterview();
  const sendAnswer = useAnswerInterview();
  const finishSession = useFinishInterview();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1.05;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Votre navigateur ne supporte pas le micro. Utilisez Chrome ou Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setInputText(transcript);
    };

    recognition.start();
  };

  const handleStart = () => {
    const cvSelect = document.getElementById("cv-select") as HTMLSelectElement;
    const offerSelect = document.getElementById(
      "offer-select",
    ) as HTMLSelectElement;

    if (!cvSelect.value || !offerSelect.value) {
      setError("Veuillez sélectionner un CV et une offre.");
      return;
    }

    setError("");
    startSession.mutate(
      { cvId: Number(cvSelect.value), jobOfferId: Number(offerSelect.value) },
      {
        onSuccess: (data) => {
          setSessionId(data.session.id);
          setMessages([{ role: "assistant", content: data.message }]);
          speak(data.message);
        },
        onError: () => setError("Erreur lors du démarrage de l'entretien."),
      },
    );
  };

  const handleSend = () => {
    if (!inputText.trim() || !sessionId) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInputText("");

    sendAnswer.mutate(
      { id: sessionId, answer: userMsg },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.message },
          ]);
          speak(data.message);
          if (data.isFinished) {
            setIsFinished(true);
            finishSession.mutate(sessionId, {
              onSuccess: (res) => setReport(res.report),
            });
          }
        },
        onError: () => setError("Erreur lors de l'envoi de la réponse."),
      },
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">Simulation d'entretien</h1>
          <p className="cvversions-page__subtitle">
            Entraînez-vous avec un recruteur IA en direct.
          </p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {startSession.isPending && <InterviewSimulationLoader />}

      {!sessionId && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <h2
            style={{
              marginBottom: 8,
              fontFamily: "var(--font-display)",
              fontSize: 26,
            }}
          >
            Prêt pour l'entretien ?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Sélectionnez le CV et l'offre pour lesquels vous voulez vous
            entraîner.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div className="field" style={{ textAlign: "left" }}>
              <label>CV</label>
              <select className="input" id="cv-select" style={{ width: 240 }}>
                <option value="">— Sélectionner —</option>
                {cvs
                  ?.filter((c) => c.processingStatus === "completed")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parsedData?.name || c.originalFileName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field" style={{ textAlign: "left" }}>
              <label>Offre</label>
              <select
                className="input"
                id="offer-select"
                style={{ width: 240 }}
              >
                <option value="">— Sélectionner —</option>
                {offers
                  ?.filter((o) => o.parsingStatus === "completed")
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title} ({o.company})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <Button
            variant="ai"
            onClick={handleStart}
            loading={startSession.isPending}
            style={{ padding: "12px 40px", borderRadius: 999 }}
          >
            <Play size={16} style={{ marginRight: 8 }} /> Démarrer l'entretien
          </Button>
        </div>
      )}

      {sessionId && (
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "70vh",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages
              .filter((m) => m.role !== "system")
              .map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    background:
                      msg.role === "user"
                        ? "var(--primary)"
                        : "var(--surface-2)",
                    color: msg.role === "user" ? "#fff" : "var(--text)",
                    padding: "12px 18px",
                    borderRadius: 16,
                    maxWidth: "75%",
                    borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                    borderBottomLeftRadius: msg.role === "assistant" ? 4 : 16,
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => speak(msg.content)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: 8,
                        opacity: 0.6,
                        verticalAlign: "middle",
                      }}
                      title="Écouter"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              ))}

            {sendAnswer.isPending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "var(--surface-2)",
                  padding: "12px 18px",
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                }}
              >
                <Spinner dark />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {!isFinished ? (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: 16,
                display: "flex",
                gap: 12,
                background: "var(--surface)",
              }}
            >
              <Button
                variant="ghost"
                onClick={startListening}
                style={{
                  color: isListening ? "#fff" : "inherit",
                  background: isListening ? "var(--danger)" : "transparent",
                  borderRadius: 999,
                  width: 44,
                  height: 44,
                  padding: 0,
                }}
                title="Cliquez pour parler"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              <input
                className="input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tapez votre réponse ou utilisez le micro..."
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                disabled={sendAnswer.isPending}
                style={{ borderRadius: 999 }}
              />
              <Button
                variant="primary"
                onClick={handleSend}
                loading={sendAnswer.isPending}
                disabled={!inputText.trim()}
                style={{ borderRadius: 999, width: 44, height: 44, padding: 0 }}
              >
                <Send size={16} />
              </Button>
            </div>
          ) : (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                borderTop: "1px solid var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <span style={{ fontWeight: 600 }}>Entretien terminé.</span>{" "}
              Consultez votre rapport ci-dessous.
            </div>
          )}
        </div>
      )}

      {report && (
        <div
          className="card"
          style={{
            marginTop: 24,
            border: "2px solid var(--accent)",
            background: "var(--surface)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                margin: 0,
              }}
            >
              Bilan de l'entretien
            </h2>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "var(--accent-hover)",
                margin: "12px 0",
              }}
            >
              {report.overallScore}
              <span style={{ fontSize: 24 }}>/100</span>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div
              style={{
                padding: 16,
                background: "var(--success-soft)",
                borderRadius: 12,
                border: "1px solid #bbf7d0",
              }}
            >
              <h3
                style={{
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 0,
                }}
              >
                <CheckCircle2 size={18} /> Points forts
              </h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {report.strengths?.map((s: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, marginBottom: 4 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                padding: 16,
                background: "var(--warning-soft)",
                borderRadius: 12,
                border: "1px solid #fde68a",
              }}
            >
              <h3
                style={{
                  color: "var(--warning)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 0,
                }}
              >
                <AlertTriangle size={18} /> À améliorer
              </h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {report.weaknesses?.map((w: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, marginBottom: 4 }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "var(--ai-soft)",
              borderRadius: 12,
              border: "1px solid #d9f99d",
            }}
          >
            <h3 style={{ color: "var(--ai)", marginTop: 0 }}>
              💡 Conseil global
            </h3>
            <p style={{ margin: 0, fontSize: 14 }}>{report.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
};
