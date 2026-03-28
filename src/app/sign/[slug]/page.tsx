"use client";

import { useState, useEffect, useRef, use } from "react";

interface Field {
  id: string;
  type: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string | null;
  required: boolean;
}

interface SigRequest {
  id: string;
  title: string;
  signerEmail: string;
  signerName: string | null;
  message: string | null;
  document: { name: string; org: { name: string; logoUrl: string | null } | null };
  fields: Field[];
}

export default function SignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [request, setRequest] = useState<SigRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"review" | "sign" | "done">("review");
  const [sigMethod, setSigMethod] = useState<"DRAW" | "TYPE">("TYPE");
  const [typedName, setTypedName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Canvas for drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetch(`/api/esignature/sign/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setRequest(data);
          setTypedName(data.signerName || "");
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [slug]);

  // Canvas drawing handlers
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0a0a0b";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureImage = (): string => {
    if (sigMethod === "DRAW") {
      return canvasRef.current?.toDataURL("image/png") || "";
    }
    // For typed: create a canvas with the text
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "italic 36px 'Georgia', serif";
      ctx.fillStyle = "#0a0a0b";
      ctx.fillText(typedName, 20, 60);
    }
    return canvas.toDataURL("image/png");
  };

  const handleSubmit = async () => {
    if (!request) return;

    // Validate required fields
    const missingFields = request.fields.filter(f => {
      if (!f.required) return false;
      if (f.type === "SIGNATURE" || f.type === "INITIALS") return false; // handled by main signature
      return !fieldValues[f.id];
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields`);
      return;
    }

    if (sigMethod === "TYPE" && !typedName.trim()) {
      alert("Please type your name for the signature");
      return;
    }

    setSubmitting(true);

    // Set signature/initials field values
    const allValues = { ...fieldValues };
    request.fields.forEach(f => {
      if (f.type === "SIGNATURE") allValues[f.id] = typedName || "Signed";
      if (f.type === "INITIALS") allValues[f.id] = typedName.split(" ").map(n => n[0]).join("").toUpperCase();
      if (f.type === "DATE" && !allValues[f.id]) allValues[f.id] = new Date().toLocaleDateString();
    });

    try {
      const res = await fetch(`/api/esignature/sign/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerEmail: request.signerEmail,
          signerName: typedName || request.signerName,
          signatureImage: getSignatureImage(),
          signatureMethod: sigMethod,
          fieldValues: allValues,
        }),
      });

      if (res.ok) {
        setStep("done");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to complete signature");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="rounded-2xl bg-white p-8 text-center max-w-sm shadow-lg border border-gray-200">
          <div className="text-4xl mb-4">&#128683;</div>
          <h1 className="text-xl font-bold text-[#0a0a0b]">{error === "Already signed" ? "Already Signed" : "Not Available"}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {error === "Already signed" ? "This document has already been signed." : error}
          </p>
        </div>
      </div>
    );
  }

  if (!request) return null;

  if (step === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="rounded-2xl bg-white p-8 text-center max-w-sm shadow-lg border border-gray-200">
          <div className="text-4xl mb-4">&#9989;</div>
          <h1 className="text-xl font-bold text-[#0a0a0b]">Signature Complete</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your signature has been recorded. The sender has been notified.
          </p>
          <p className="mt-4 text-[10px] text-gray-400">
            A tamper-proof audit hash has been generated for legal compliance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <span style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em" }}>
              p<span style={{ color: "#6C5CE7" }}>eee</span>ky
            </span>
            <span className="ml-2 text-xs text-gray-400">eSignature</span>
          </div>
          <span className="text-xs text-gray-500">{request.signerEmail}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {step === "review" && (
          <div>
            <div className="rounded-2xl bg-white border border-gray-200 p-8 mb-6">
              <h1 className="text-2xl font-bold text-[#0a0a0b] mb-2">{request.title}</h1>
              <p className="text-sm text-gray-500 mb-4">
                From: {request.document.org?.name || "Unknown"} &bull; Document: {request.document.name}
              </p>
              {request.message && (
                <div className="rounded-xl bg-gray-50 p-4 mb-6">
                  <p className="text-sm text-gray-700">{request.message}</p>
                </div>
              )}

              <h2 className="text-sm font-semibold text-[#0a0a0b] mb-3">Fields to complete:</h2>
              <div className="space-y-3">
                {request.fields.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {f.type === "SIGNATURE" ? "✍️" : f.type === "INITIALS" ? "🔤" : f.type === "DATE" ? "📅" : f.type === "CHECKBOX" ? "☑️" : "📝"}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-[#0a0a0b]">{f.type}</span>
                        <span className="text-xs text-gray-400 ml-2">Page {f.pageNumber}</span>
                      </div>
                    </div>
                    {f.type === "TEXT" && (
                      <input
                        type="text"
                        value={fieldValues[f.id] || ""}
                        onChange={(e) => setFieldValues({ ...fieldValues, [f.id]: e.target.value })}
                        placeholder={f.label || "Enter text"}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#6C5CE7] w-48"
                      />
                    )}
                    {f.type === "CHECKBOX" && (
                      <input
                        type="checkbox"
                        checked={fieldValues[f.id] === "true"}
                        onChange={(e) => setFieldValues({ ...fieldValues, [f.id]: e.target.checked ? "true" : "" })}
                        className="rounded border-gray-300 text-[#6C5CE7] w-5 h-5"
                      />
                    )}
                    {f.type === "DATE" && (
                      <input
                        type="date"
                        value={fieldValues[f.id] || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFieldValues({ ...fieldValues, [f.id]: e.target.value })}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#6C5CE7]"
                      />
                    )}
                    {(f.type === "SIGNATURE" || f.type === "INITIALS") && (
                      <span className="text-xs text-gray-400">Will be signed in next step</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep("sign")}
              className="w-full rounded-xl bg-[#6C5CE7] py-4 text-base font-semibold text-white hover:bg-[#6C5CE7]/90 transition"
            >
              Continue to Sign
            </button>
          </div>
        )}

        {step === "sign" && (
          <div>
            <div className="rounded-2xl bg-white border border-gray-200 p-8 mb-6">
              <h2 className="text-xl font-bold text-[#0a0a0b] mb-6">Add Your Signature</h2>

              {/* Method tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSigMethod("TYPE")}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
                    sigMethod === "TYPE" ? "bg-[#6C5CE7] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Type Signature
                </button>
                <button
                  onClick={() => setSigMethod("DRAW")}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
                    sigMethod === "DRAW" ? "bg-[#6C5CE7] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Draw Signature
                </button>
              </div>

              {sigMethod === "TYPE" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Type your full legal name</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
                  />
                  {typedName && (
                    <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <p className="text-xs text-gray-400 mb-2">Preview</p>
                      <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "32px", color: "#0a0a0b" }}>
                        {typedName}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {sigMethod === "DRAW" && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Draw your signature below:</p>
                  <div className="rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={150}
                      className="w-full cursor-crosshair"
                      style={{ touchAction: "none" }}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                    />
                  </div>
                  <button onClick={clearCanvas} className="mt-2 text-xs text-gray-500 hover:text-[#6C5CE7]">
                    Clear and redraw
                  </button>
                </div>
              )}

              {/* Legal notice */}
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By clicking &ldquo;Complete Signature&rdquo; below, I agree that the signature above is a valid
                  electronic representation of my signature, has the same legal validity as a handwritten signature,
                  and that I have authority to sign this document. This action is recorded with my email address,
                  IP address, and a tamper-proof cryptographic hash.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("review")}
                className="flex-1 rounded-xl border border-gray-200 py-4 text-base font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                &larr; Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || (sigMethod === "TYPE" && !typedName.trim())}
                className="flex-[2] rounded-xl bg-[#6C5CE7] py-4 text-base font-semibold text-white hover:bg-[#6C5CE7]/90 transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Complete Signature"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
