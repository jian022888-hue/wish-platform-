"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResponseType } from "@/types";

const responseTypes: ResponseType[] = [
  "Advice",
  "Resource",
  "Introduction",
  "Opportunity",
  "Support",
  "Similar Experience",
];

const typeLabels: Record<ResponseType, string> = {
  Advice: "经验建议",
  Resource: "资源提供",
  Introduction: "人脉引荐",
  Opportunity: "机会线索",
  Support: "陪伴支持",
  "Similar Experience": "相似经历",
};

interface ValidationErrors {
  content?: string;
  type?: string;
  authorName?: string;
}

interface ResponseFormProps {
  wishId: string;
}

export function ResponseForm({ wishId }: ResponseFormProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedType, setSelectedType] = useState<ResponseType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case "content":
        if (!value || !value.trim()) return "请输入回应内容";
        if (value.trim().length < 10) return "回应内容至少需要 10 个字符";
        return undefined;
      case "type":
        if (!value) return "请选择回应类型";
        return undefined;
      case "authorName":
        if (!isAnonymous && value && value.trim().length > 50)
          return "名字不能超过 50 个字符";
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    if (touched.content) {
      const error = validateField("content", value);
      setErrors((prev) => ({ ...prev, content: error }));
    }
  };

  const handleTypeSelect = (type: ResponseType) => {
    setSelectedType(type === selectedType ? null : type);
    if (touched.type) {
      const error = validateField("type", type === selectedType ? null : type);
      setErrors((prev) => ({ ...prev, type: error }));
    }
  };

  const handleSubmit = async () => {
    const contentError = validateField("content", content);
    const typeError = validateField("type", selectedType);
    
    if (contentError || typeError) {
      setTouched({ content: true, type: true });
      setErrors({ content: contentError, type: typeError });
      setSubmitError(contentError || typeError || null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/wishes/${wishId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: isAnonymous ? "" : (authorName.trim() || "匿名"),
          isAnonymous,
          type: selectedType!,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "提交失败");

      setContent("");
      setAuthorName("");
      setIsAnonymous(false);
      setSelectedType(null);
      setTouched({});
      setErrors({});
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "提交失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[30px] bg-stone-100/75 p-5 sm:p-6 dark:bg-surface-dark">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">
        留下一份回声
      </p>

      <div className="mt-4">
        <textarea
          className={cn(
            "min-h-[140px] w-full resize-none rounded-[24px] border bg-white/70 px-5 py-4 text-sm leading-8 text-ink outline-none transition placeholder:text-ink/36 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60",
            errors.content && touched.content
              ? "border-red-400 focus:border-red-500"
              : "border-stone-200",
          )}
          onBlur={() => handleBlur("content", content)}
          onChange={handleContentChange}
          placeholder="你能为这个愿望提供什么帮助？"
          value={content}
        />
        {errors.content && touched.content && (
          <p className="mt-2 text-xs text-red-600">{errors.content}</p>
        )}
      </div>

      <div className={cn("mt-4 transition-opacity", isAnonymous && "opacity-50 pointer-events-none")}>
        <div>
          <input
            className={cn(
              "w-full rounded-[20px] border bg-white/70 px-4 py-2.5 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/36 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60",
              errors.authorName && touched.authorName
                ? "border-red-400 focus:border-red-500"
                : "border-stone-200",
            )}
            disabled={isAnonymous}
            onBlur={() => handleBlur("authorName", authorName)}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="你的名字（可选）"
            value={authorName}
          />
          {errors.authorName && touched.authorName && (
            <p className="mt-2 text-xs text-red-600">{errors.authorName}</p>
          )}
        </div>
      </div>

      <button
        className={cn(
          "mt-4 flex w-full items-center justify-between gap-3 rounded-[20px] border border-stone-200/80 bg-white/70 px-4 py-3 text-left text-sm transition hover:border-clay/40 dark:bg-surface-dark dark:border-stone-700/80",
          isAnonymous && "border-clay/50 bg-sand/20 dark:bg-clay/10",
        )}
        onClick={() => setIsAnonymous(!isAnonymous)}
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-5 w-9 rounded-full border p-0.5 transition",
              isAnonymous
                ? "justify-end border-ink bg-ink dark:border-ink-light dark:bg-ink-light"
                : "justify-start border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-700",
            )}
          >
            <span className="block h-4 w-4 rounded-full bg-white" />
          </span>
          <span className="text-ink/70 dark:text-ink-light/70">匿名回应</span>
        </div>
        <span className="text-ink/40 dark:text-ink-light/40">{isAnonymous ? "已开启" : "不显示名字"}</span>
      </button>

      <div className="mt-4">
        <p className="text-sm text-ink/56 dark:text-ink-light/56">选择回应类型</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {responseTypes.map((type) => {
            const selected = selectedType === type;
            return (
              <button
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition",
                  selected
                    ? "border-ink bg-ink text-white dark:border-ink-light dark:bg-ink-light dark:text-background-dark"
                    : "border-line bg-white/80 text-ink/70 hover:border-clay/50 hover:text-ink dark:bg-surface-dark dark:text-ink-light/70 dark:hover:text-ink-light dark:border-stone-700",
                )}
                key={type}
                onClick={() => handleTypeSelect(type)}
                type="button"
              >
                {typeLabels[type]}
              </button>
            );
          })}
        </div>
        {errors.type && touched.type && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.type}</p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {submitError && (
            <p className="text-sm text-red-600/80">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-sm text-moss">
              感谢你的回声，它已被收到。
            </p>
          )}
        </div>
        <Button
          className="px-6"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "提交中…" : "写下帮助"}
        </Button>
      </div>
    </div>
  );
}
