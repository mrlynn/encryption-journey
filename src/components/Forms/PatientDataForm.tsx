"use client";

import { useState } from "react";
import { EncryptionMode } from "@/types/trace";

// EncryptionSelector component for choosing encryption type
interface EncryptionSelectorProps {
  value: EncryptionMode;
  onChange: (mode: EncryptionMode) => void;
  tooltip?: string;
}

const EncryptionSelector: React.FC<EncryptionSelectorProps> = ({
  value,
  onChange,
  tooltip
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getEncryptionColor = (mode: EncryptionMode): string => {
    switch (mode) {
      case "qe": return "bg-primary/20 text-primary border-primary/30";
      case "det": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rand": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  return (
    <div className="relative">
      <div
        className={`px-2 py-1 rounded text-xs font-mono cursor-pointer border ${getEncryptionColor(value)}`}
        onClick={() => {
          const nextMode = value === "none" ? "qe" :
                           value === "qe" ? "det" :
                           value === "det" ? "rand" : "none";
          onChange(nextMode);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {value.toUpperCase()}
      </div>

      {showTooltip && tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 p-2 bg-mongo-dark-800 border border-accent/30 rounded shadow-lg z-10 text-xs text-neutral-300">
          {tooltip}
        </div>
      )}
    </div>
  );
};

// Main form component
interface PatientDataFormProps {
  onSubmit?: (data: PatientFormData) => void;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  medicalNotes: string;
  encryptionSettings: {
    firstName: EncryptionMode;
    lastName: EncryptionMode;
    ssn: EncryptionMode;
    dateOfBirth: EncryptionMode;
    medicalNotes: EncryptionMode;
  };
}

export const PatientDataForm: React.FC<PatientDataFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "Jane",
    lastName: "Smith",
    ssn: "123-45-6789",
    dateOfBirth: "1990-05-15",
    medicalNotes: "Patient has a history of hypertension. Prescribing amlodipine 5mg daily.",
    encryptionSettings: {
      firstName: "none",
      lastName: "qe",
      ssn: "rand",
      dateOfBirth: "det",
      medicalNotes: "rand"
    }
  });

  const handleChange = (field: keyof Omit<PatientFormData, "encryptionSettings">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEncryptionChange = (field: keyof PatientFormData["encryptionSettings"], mode: EncryptionMode) => {
    setFormData(prev => ({
      ...prev,
      encryptionSettings: {
        ...prev.encryptionSettings,
        [field]: mode
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "Jane",
      lastName: "Smith",
      ssn: "123-45-6789",
      dateOfBirth: "1990-05-15",
      medicalNotes: "Patient has a history of hypertension. Prescribing amlodipine 5mg daily.",
      encryptionSettings: {
        firstName: "none",
        lastName: "qe",
        ssn: "rand",
        dateOfBirth: "det",
        medicalNotes: "rand"
      }
    });
  };

  return (
    <div className="p-6 bg-mongo-dark-800 rounded-lg border border-accent/20">
      <h2 className="text-xl font-semibold text-primary mb-4">Create Patient Record</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Patient Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">First Name</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="w-full bg-mongo-dark-700 border border-accent/20 rounded p-2 text-neutral-200"
                placeholder="Jane"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <EncryptionSelector
                value={formData.encryptionSettings.firstName}
                onChange={(mode) => handleEncryptionChange("firstName", mode)}
                tooltip="Non-sensitive data doesn't need encryption"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">Last Name</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="w-full bg-mongo-dark-700 border border-accent/20 rounded p-2 text-neutral-200"
                placeholder="Smith"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
              <EncryptionSelector
                value={formData.encryptionSettings.lastName}
                onChange={(mode) => handleEncryptionChange("lastName", mode)}
                tooltip="QE allows equality searches on this field"
              />
            </div>
          </div>
        </div>

        {/* SSN Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-1">SSN</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full bg-mongo-dark-700 border border-accent/20 rounded p-2 text-neutral-200"
              placeholder="123-45-6789"
              value={formData.ssn}
              onChange={(e) => handleChange("ssn", e.target.value)}
            />
            <EncryptionSelector
              value={formData.encryptionSettings.ssn}
              onChange={(mode) => handleEncryptionChange("ssn", mode)}
              tooltip="Highly sensitive data should use randomized encryption"
            />
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            SSNs should use randomized encryption for maximum security
          </p>
        </div>

        {/* Date of Birth Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-1">Date of Birth</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="w-full bg-mongo-dark-700 border border-accent/20 rounded p-2 text-neutral-200"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
            <EncryptionSelector
              value={formData.encryptionSettings.dateOfBirth}
              onChange={(mode) => handleEncryptionChange("dateOfBirth", mode)}
              tooltip="Deterministic encryption allows exact matching queries"
            />
          </div>
        </div>

        {/* Medical Notes Field */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-1">Medical Notes</label>
          <div className="flex items-center gap-2">
            <textarea
              className="w-full bg-mongo-dark-700 border border-accent/20 rounded p-2 text-neutral-200"
              rows={3}
              placeholder="Patient notes and observations..."
              value={formData.medicalNotes}
              onChange={(e) => handleChange("medicalNotes", e.target.value)}
            />
            <EncryptionSelector
              value={formData.encryptionSettings.medicalNotes}
              onChange={(mode) => handleEncryptionChange("medicalNotes", mode)}
              tooltip="Free text should use randomized encryption"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-500 transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-mongo-dark-900 font-medium rounded hover:bg-primary/90 transition-colors"
          >
            Submit Patient Record
          </button>
        </div>
      </form>
    </div>
  );
};