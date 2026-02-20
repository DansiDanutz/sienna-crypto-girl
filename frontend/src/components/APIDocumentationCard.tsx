"use client";

import { useState } from "react";
import { ArrowRight, Zap, BookOpen, Database, Cloud, Key } from "lucide-react";

export default function APIDocumentationCard() {
  return (
    <div className="bg-gradient-to-br from-cyan-900/40 via-cyan-800/30 to-cyan-700/40 border border-cyan-500/50 rounded-xl p-6 hover:scale-105 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-8 h-8 text-cyan-400" />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Same APIs as Sienna
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-lg text-muted-foreground">
          Subscribers get access to <strong className="text-cyan-300">ALL the same APIs</strong> that power Sienna's 96.2% win rate!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🔑</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-cyan-300">DeepSeek</div>
              <div className="text-sm text-muted-foreground">V3 - High-performance reasoning</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-purple-300">Gemini</div>
              <div className="text-sm text-muted-foreground">2.0 Flash - Fast multimodal</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-green-300">OpenRouter</div>
              <div className="text-sm text-muted-foreground">100+ models - Claude, GPT, Gemini</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-orange-300">xAI (Grok)</div>
              <div className="text-sm text-muted-foreground">Real-time web search</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-blue-300">Z.ai (GLM)</div>
              <div className="text-sm text-muted-foreground">GLM-4.7 - 128K context</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-300">All APIs configured on Vercel</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
          <div className="flex-1">
            <Database className="w-4 h-4" />
            <span className="text-cyan-300">Full API documentation</span>
          </div>
          <div className="flex-1">
            <Cloud className="w-4 h-4" />
            <span className="text-cyan-300">Ready-to-use examples</span>
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
        <Zap className="w-5 h-5" />
        <span>View API Documentation</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
