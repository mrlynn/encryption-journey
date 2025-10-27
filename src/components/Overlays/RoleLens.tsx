"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserRole, RolePermissions } from "@/types/trace";

interface RoleLensProps {
  onRoleChange?: (role: UserRole) => void;
  activeRole: string | null;
  setActiveRole: (role: UserRole | null) => void;
}

export const RoleLens = memo(({ onRoleChange, activeRole, setActiveRole }: RoleLensProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("doctor");

  const rolePermissions: RolePermissions = {
    doctor: {
      canView: [
        "patient.firstName",
        "patient.lastName",
        "patient.dateOfBirth",
        "patient.ssn",
        "patient.medicalNotes",
        "patient.insuranceId",
      ],
      canEdit: [
        "patient.medicalNotes",
        "patient.insuranceId",
      ],
      description: "Full access to all patient data for medical care",
    },
    nurse: {
      canView: [
        "patient.firstName",
        "patient.lastName",
        "patient.dateOfBirth",
        "patient.medicalNotes",
      ],
      canEdit: [
        "patient.medicalNotes",
      ],
      description: "Access to patient data needed for nursing care",
    },
    receptionist: {
      canView: [
        "patient.firstName",
        "patient.lastName",
        "patient.insuranceId",
      ],
      canEdit: [],
      description: "Limited access for administrative tasks",
    },
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setActiveRole(role);
    onRoleChange?.(role);
  };

  const getRoleIcon = (role: UserRole) => {
    const icons: Record<UserRole, string> = {
      doctor: "👨‍⚕️",
      nurse: "👩‍⚕️",
      receptionist: "👩‍💼",
    };
    return icons[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      doctor: "#00ED64",
      nurse: "#45B7D1",
      receptionist: "#FECA57",
    };
    return colors[role];
  };

  const currentPermissions = rolePermissions[selectedRole];

  return (
    <div className="absolute top-4 left-4 z-10">
      {/* Toggle Button */}
      <motion.button
        className="bg-mongo-dark-800 hover:bg-mongo-dark-700 border border-accent/20 text-neutral-200 px-4 py-2 rounded-lg shadow-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getRoleIcon(selectedRole)}</span>
          <span className="font-semibold">Role Lens</span>
        </div>
      </motion.button>

      {/* Role Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-12 left-0 w-80 bg-mongo-dark-800 border border-accent/20 rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-accent/20">
              <h3 className="text-lg font-semibold text-primary">Role-Based Access</h3>
              <p className="text-sm text-neutral-400">
                Simulate different user roles and their field access
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Role Selection */}
              <div className="p-4 border-b border-accent/10">
                <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wide">
                  Select Role
                </h4>
                <div className="space-y-2">
                  {Object.entries(rolePermissions).map(([role, permissions]) => (
                    <motion.button
                      key={role}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedRole === role
                          ? "border-primary bg-primary/10"
                          : "border-accent/20 bg-mongo-dark-700 hover:bg-mongo-dark-600"
                      }`}
                      onClick={() => handleRoleChange(role as UserRole)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl">{getRoleIcon(role as UserRole)}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-neutral-200 capitalize">
                          {role}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {permissions.description}
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRoleColor(role as UserRole) }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Field Access */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wide">
                  Field Access
                </h4>
                
                {/* Viewable Fields */}
                <div className="mb-4">
                  <div className="text-xs text-neutral-400 mb-2">Can View:</div>
                  <div className="space-y-1">
                    {currentPermissions.canView.map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-xs font-mono text-neutral-200">
                          {field}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editable Fields */}
                {currentPermissions.canEdit.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-neutral-400 mb-2">Can Edit:</div>
                    <div className="space-y-1">
                      {currentPermissions.canEdit.map((field, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-xs font-mono text-neutral-200">
                            {field}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restricted Fields */}
                <div>
                  <div className="text-xs text-neutral-400 mb-2">Restricted:</div>
                  <div className="space-y-1">
                    {[
                      "patient.firstName",
                      "patient.lastName",
                      "patient.dateOfBirth",
                      "patient.ssn",
                      "patient.medicalNotes",
                      "patient.insuranceId",
                    ]
                      .filter(field => !currentPermissions.canView.includes(field))
                      .map((field, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          <span className="text-xs font-mono text-neutral-500">
                            {field}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-accent/20 bg-mongo-dark-700">
              <div className="text-xs text-neutral-400 text-center">
                Role-based access control ensures data privacy and compliance
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

RoleLens.displayName = "RoleLens";
