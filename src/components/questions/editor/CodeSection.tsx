import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

import Editor from "@monaco-editor/react";
import { Code2, Play, Terminal, XCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/constants";
import { executeCodeAction } from "@/actions/execute";
import { cn } from "@/lib/utils";

import type { CodeSectionProps } from "@/types/editor";

export const CodeSection = ({ code, language, onUpdate }: CodeSectionProps) => {
  const { t } = useTranslation();
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setOutput(null);
    setRunError(false);

    try {
      // In JS, Java, and CPP, LeetCode default code might not compile out of the box if it has no wrappers.
      // But we will send it to the server action anyway.
      const res = await executeCodeAction(language, code);
      if (res && res.output) {
        setOutput(res.output);
        setRunError(res.error || !res.success);
      } else {
        setOutput("Execution finished, but no output was returned.");
      }
    } catch (error: any) {
      setOutput(error.message || "Failed to execute code.");
      setRunError(true);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[500px] lg:h-full">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            {t("codeSection.title")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={language}
            onValueChange={(val) => onUpdate("language", val)}
          >
            <SelectTrigger className="w-[140px] h-8 bg-white border-gray-200">
              <SelectValue placeholder={t("codeSection.languagePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={handleRunCode}
            disabled={isExecuting || !code.trim()}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-md bg-[#ffa116] hover:bg-orange-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Run Code Locally"
          >
            {isExecuting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" fill="currentColor" />
            )}
            {isExecuting ? t("codeSection.running") || "Running" : t("codeSection.run") || "Run"}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme="light"
          value={code}
          onChange={(value) => onUpdate("code", value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>

      {/* Execution Terminal Panel */}
      {(output !== null || isExecuting) && (
        <div className="border-t border-gray-200 flex flex-col bg-gray-900 text-gray-100 h-1/3 min-h-[160px] shrink-0">
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold font-mono tracking-wider">
                {t("codeSection.console") || "CONSOLE"}
              </span>
            </div>
            <button
              onClick={() => setOutput(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto font-mono text-sm">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing code...</span>
              </div>
            ) : (
              <pre
                className={cn(
                  "whitespace-pre-wrap break-all",
                  runError ? "text-red-400" : "text-emerald-300"
                )}
              >
                {output}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
