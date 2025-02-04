import { useState } from "react";

interface UseJsonFileReturn {
  jsonContent: unknown;
  error: string;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

export const useJsonFile = (): UseJsonFileReturn => {
  const [jsonContent, setJsonContent] = useState<unknown>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setJsonContent(null);
    setError("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;

    if (file.type !== "application/json") {
      setError("Please upload a JSON file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") {
          throw new Error("Expected string result from FileReader");
        }

        const content = JSON.parse(result) as unknown;
        setJsonContent(content);
      } catch (err) {
        setError("Invalid JSON format");
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsText(file);
  };

  return {
    jsonContent,
    error,
    handleFileUpload,
    reset,
  };
};
