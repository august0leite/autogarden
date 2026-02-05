"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, MoreVertical } from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

interface Work {
  id: string;
  title: string;
  createdAt: string;
  authors: number;
  ownership: number;
  status: "registered" | "draft" | "pending";
  visibility: "public" | "private";
}

interface MyWorksViewProps {
  onCreateWork: () => void;
}

export function MyWorksView({ onCreateWork }: MyWorksViewProps) {
  const [works] = useState<Work[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const hasWorks = works.length > 0;

  if (!hasWorks) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6"
      >
        {/* Icon */}
        <div className="mb-6 p-6 bg-violet/10 border border-violet/20 rounded-2xl">
          <svg
            className="w-16 h-16 text-violet"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-bold text-white mb-3 text-center">
          No music works registered yet.
        </h2>
        <p className="text-gray text-center mb-8 max-w-md">
          Create your first work to establish authorship and ownership records.
        </p>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          onClick={onCreateWork}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create your first work
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* List Controls */}
      <div className="flex flex-col gap-4">
        {/* Top row - Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
            <input
              type="text"
              placeholder="Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-indigo border border-border text-white placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>
          <Button
            variant="primary"
            size="default"
            onClick={onCreateWork}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Work
          </Button>
        </div>

        {/* Filters row */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray" />
            <span className="text-sm text-gray">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 rounded-lg bg-indigo border border-border text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet"
            >
              <option value="all">All</option>
              <option value="registered">Registered</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 rounded-lg bg-indigo border border-border text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Works List */}
      <div className="space-y-3">
        {works.map((work, idx) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-indigo/30 border border-border rounded-lg p-4 hover:bg-indigo/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate mb-1">
                  {work.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray">
                  <span>{work.createdAt}</span>
                  <span>•</span>
                  <span>{work.authors} author(s)</span>
                  <span>•</span>
                  <span>{work.ownership}% ownership</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    work.status === "registered"
                      ? "bg-green-500/10 text-green-400"
                      : work.status === "draft"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {work.status.charAt(0).toUpperCase() + work.status.slice(1)}
                </span>

                {/* Visibility */}
                <span className="flex items-center gap-1 text-xs text-gray">
                  <Eye className="w-4 h-4" />
                  {work.visibility === "public" ? "Public" : "Private"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="p-2 rounded-lg text-gray hover:bg-indigo hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-gray hover:bg-indigo hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-gray hover:bg-indigo hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
