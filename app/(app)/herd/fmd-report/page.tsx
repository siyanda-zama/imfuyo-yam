'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug, ChevronLeft, ChevronRight, Check, MapPin, Stethoscope,
  AlertTriangle, FileText, Send,
} from 'lucide-react';
import { FMD_SYMPTOMS, FMD_SUSCEPTIBLE_TYPES } from '@/lib/provinces';

interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const STEPS = ['Farm & Animal', 'Symptoms', 'Severity', 'Vet & Quarantine', 'Review'];

export default function FmdReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [farmId, setFarmId] = useState('');
  const [animalType, setAnimalType] = useState('COW');
  const [affectedCount, setAffectedCount] = useState(1);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState('SUSPECTED');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [vetNotified, setVetNotified] = useState(false);
  const [vetName, setVetName] = useState('');
  const [quarantineStarted, setQuarantineStarted] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/api/farms')
      .then((r) => r.json())
      .then(setFarms)
      .catch(console.error);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const canProceed = () => {
    if (step === 0) return !!farmId;
    if (step === 1) return symptoms.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/fmd/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId, animalType, affectedCount, severity, symptoms,
          notes: notes || null, latitude, longitude, vetNotified,
          vetName: vetName || null, quarantineStarted,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit FMD report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check size={32} className="text-primary" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-sm text-text-secondary mb-6">
            Your FMD report has been submitted successfully. Authorities will be notified.
          </p>
          <button
            onClick={() => router.push('/herd')}
            className="bg-primary text-white font-display font-semibold px-6 py-3 rounded-xl"
          >
            Back to Herd
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="text-text-secondary">
            <ChevronLeft size={20} />
          </button>
          <Bug size={18} className="text-danger" />
          <h1 className="font-display text-sm font-bold text-white flex-1">Report FMD Case</h1>
          <span className="text-[10px] text-text-muted">Step {step + 1}/{STEPS.length}</span>
        </div>
        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-2">
          <div className="h-1 bg-surface-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-danger rounded-full"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-[8px] ${i <= step ? 'text-danger' : 'text-text-muted'}`}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* Step 0: Farm & Animal */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-2">Select Farm</label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="w-full bg-surface border border-border/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="">Choose a farm...</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-2">Animal Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {FMD_SUSCEPTIBLE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setAnimalType(t)}
                      className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                        animalType === t
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-surface border border-border/30 text-text-secondary'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-2">Number of Affected Animals</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-surface border border-border/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                />
              </div>
            </motion.div>
          )}

          {/* Step 1: Symptoms */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
              <p className="text-xs text-text-muted mb-3">Select all observed symptoms:</p>
              {FMD_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom.key}
                  onClick={() => toggleSymptom(symptom.key)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-colors text-left ${
                    symptoms.includes(symptom.key)
                      ? 'bg-danger/10 border border-danger/30'
                      : 'bg-surface border border-border/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    symptoms.includes(symptom.key)
                      ? 'bg-danger border-danger'
                      : 'border-border/50'
                  }`}>
                    {symptoms.includes(symptom.key) && <Check size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm ${symptoms.includes(symptom.key) ? 'text-white' : 'text-text-secondary'}`}>
                    {symptom.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Severity & Location */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-2">Severity Level</label>
                <div className="space-y-2">
                  {(['SUSPECTED', 'CONFIRMED'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left ${
                        severity === s
                          ? s === 'CONFIRMED' ? 'bg-danger/10 border border-danger/30' : 'bg-warning/10 border border-warning/30'
                          : 'bg-surface border border-border/30'
                      }`}
                    >
                      <AlertTriangle size={18} className={severity === s ? (s === 'CONFIRMED' ? 'text-danger' : 'text-warning') : 'text-text-muted'} />
                      <div>
                        <p className={`text-sm font-medium ${severity === s ? 'text-white' : 'text-text-secondary'}`}>{s}</p>
                        <p className="text-[10px] text-text-muted">
                          {s === 'SUSPECTED' ? 'Clinical signs observed, awaiting lab confirmation' : 'Laboratory confirmed FMD positive'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-surface rounded-xl border border-border/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-xs text-text-secondary font-medium">GPS Location</span>
                </div>
                {latitude && longitude ? (
                  <p className="text-sm text-white">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                ) : (
                  <p className="text-xs text-text-muted">Acquiring GPS location...</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Vet & Quarantine */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <button
                  onClick={() => setVetNotified(!vetNotified)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left ${
                    vetNotified ? 'bg-primary/10 border border-primary/30' : 'bg-surface border border-border/30'
                  }`}
                >
                  <Stethoscope size={18} className={vetNotified ? 'text-primary' : 'text-text-muted'} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${vetNotified ? 'text-white' : 'text-text-secondary'}`}>Veterinarian Notified</p>
                    <p className="text-[10px] text-text-muted">Has a vet been contacted about this case?</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${vetNotified ? 'bg-primary' : 'bg-surface-light'}`}>
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full mt-0.5"
                      animate={{ marginLeft: vetNotified ? 18 : 2 }}
                    />
                  </div>
                </button>
              </div>
              {vetNotified && (
                <div>
                  <label className="text-xs text-text-secondary font-medium block mb-2">Veterinarian Name</label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    placeholder="e.g. Dr. Nkosi"
                    className="w-full bg-surface border border-border/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>
              )}
              <div>
                <button
                  onClick={() => setQuarantineStarted(!quarantineStarted)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left ${
                    quarantineStarted ? 'bg-warning/10 border border-warning/30' : 'bg-surface border border-border/30'
                  }`}
                >
                  <AlertTriangle size={18} className={quarantineStarted ? 'text-warning' : 'text-text-muted'} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${quarantineStarted ? 'text-white' : 'text-text-secondary'}`}>Quarantine Started</p>
                    <p className="text-[10px] text-text-muted">Have affected animals been isolated?</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${quarantineStarted ? 'bg-warning' : 'bg-surface-light'}`}>
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full mt-0.5"
                      animate={{ marginLeft: quarantineStarted ? 18 : 2 }}
                    />
                  </div>
                </button>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-2">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional observations or details..."
                  className="w-full bg-surface border border-border/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <h2 className="font-display text-base font-bold text-white mb-2">Review Report</h2>
              <div className="bg-surface rounded-xl border border-border/30 p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Farm</span>
                  <span className="text-white font-medium">{farms.find((f) => f.id === farmId)?.name || '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Animal Type</span>
                  <span className="text-white font-medium">{animalType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Affected Count</span>
                  <span className="text-white font-medium">{affectedCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Severity</span>
                  <span className={`font-bold ${severity === 'CONFIRMED' ? 'text-danger' : 'text-warning'}`}>{severity}</span>
                </div>
                <div className="text-xs">
                  <span className="text-text-muted block mb-1">Symptoms ({symptoms.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {symptoms.map((s) => {
                      const sym = FMD_SYMPTOMS.find((fs) => fs.key === s);
                      return (
                        <span key={s} className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                          {sym?.label.split(',')[0] || s}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {vetNotified && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Vet</span>
                    <span className="text-primary">{vetName || 'Notified'}</span>
                  </div>
                )}
                {quarantineStarted && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Quarantine</span>
                    <span className="text-warning">Active</span>
                  </div>
                )}
                {notes && (
                  <div className="text-xs">
                    <span className="text-text-muted block mb-1">Notes</span>
                    <p className="text-text-secondary">{notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons — above bottom nav */}
        <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/30 p-4">
          <div className="max-w-lg mx-auto flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-surface border border-border/30 text-text-secondary font-display font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`flex-1 font-display font-semibold py-3 rounded-xl flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-danger text-white'
                    : 'bg-surface text-text-muted cursor-not-allowed'
                }`}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-danger text-white font-display font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} /> Submit Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
