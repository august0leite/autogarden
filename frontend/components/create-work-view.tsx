"use client";

import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

interface Contributor {
  id: string;
  name: string;
  role: string;
  ownership: number;
}

interface CreateWorkViewProps {
  onCancel: () => void;
}

export function CreateWorkView({ onCancel }: CreateWorkViewProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creationDate, setCreationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [contributors, setContributors] = useState<Contributor[]>([
    {
      id: "1",
      name: "You",
      role: "Composer",
      ownership: 100,
    },
  ]);
  const [newContributor, setNewContributor] = useState({ name: "", role: "" });

  const totalOwnership = contributors.reduce((sum, c) => sum + c.ownership, 0);

  const handleAddContributor = () => {
    if (newContributor.name && newContributor.role) {
      setContributors([
        ...contributors,
        {
          id: Date.now().toString(),
          name: newContributor.name,
          role: newContributor.role,
          ownership: 0,
        },
      ]);
      setNewContributor({ name: "", role: "" });
    }
  };

  const handleRemoveContributor = (id: string) => {
    if (contributors.length > 1) {
      setContributors(contributors.filter((c) => c.id !== id));
    }
  };

  const handleOwnershipChange = (id: string, ownership: number) => {
    setContributors(
      contributors.map((c) =>
        c.id === id ? { ...c, ownership } : c
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Main form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Work Details */}
        <div className="bg-indigo/30 border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Work details</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="Grow name, strain, location, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-midnight/50 border border-border text-white placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe your work (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-midnight/50 border border-border text-white placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-violet resize-none"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
              Creation date
            </label>
            <input
              id="date"
              type="date"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-midnight/50 border border-border text-white focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-indigo/30 border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Contributors</h3>

          {/* Contributors list */}
          <div className="space-y-3">
            {contributors.map((contributor, idx) => (
              <div
                key={contributor.id}
                className="flex items-center gap-3 bg-midnight/30 rounded-lg p-3"
              >
                <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-violet" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{contributor.name}</p>
                  <p className="text-xs text-gray">{contributor.role}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={contributor.ownership}
                    onChange={(e) =>
                      handleOwnershipChange(
                        contributor.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-16 px-2 py-1 rounded bg-midnight/50 border border-border text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-violet"
                  />
                  <span className="text-sm text-gray w-5">%</span>
                </div>

                {contributors.length > 1 && (
                  <button
                    onClick={() => handleRemoveContributor(contributor.id)}
                    className="p-1.5 rounded text-gray hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add contributor form */}
          <div className="border-t border-border/50 pt-4 space-y-3">
            <p className="text-sm text-gray">Add another contributor</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newContributor.name}
                onChange={(e) =>
                  setNewContributor({ ...newContributor, name: e.target.value })
                }
                className="flex-1 px-3 py-2 rounded-lg bg-midnight/50 border border-border text-white placeholder:text-gray/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
              <input
                type="text"
                placeholder="Role"
                value={newContributor.role}
                onChange={(e) =>
                  setNewContributor({ ...newContributor, role: e.target.value })
                }
                className="flex-1 px-3 py-2 rounded-lg bg-midnight/50 border border-border text-white placeholder:text-gray/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
              <button
                onClick={handleAddContributor}
                className="p-2 rounded-lg bg-violet hover:bg-violet/80 text-white transition-colors flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary panel */}
      <div className="lg:col-span-1">
        <div className="bg-indigo/30 border border-border rounded-lg p-6 sticky top-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>

            {/* Total ownership */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray">Total ownership</span>
                <span
                  className={`text-2xl font-bold ${
                    totalOwnership === 100
                      ? "text-green-400"
                      : totalOwnership > 100
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {totalOwnership}%
                </span>
              </div>
              <div className="w-full bg-midnight/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min(totalOwnership, 100)}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${
                    totalOwnership === 100
                      ? "bg-green-500"
                      : totalOwnership > 100
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                />
              </div>
              <p className="text-xs text-gray mt-2">
                {totalOwnership === 100
                  ? "✓ Ownership allocation complete"
                  : totalOwnership > 100
                  ? "⚠ Ownership exceeds 100%"
                  : "⚠ Ownership is incomplete"}
              </p>
            </div>

            {/* Contributors summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray">Contributors</p>
              <div className="space-y-1">
                {contributors.map((c) => (
                  <div key={c.id} className="flex justify-between text-xs">
                    <span className="text-gray">{c.name}</span>
                    <span className="font-medium text-white">{c.ownership}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-6 border-t border-border/50">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={totalOwnership !== 100}
            >
              Create work
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
