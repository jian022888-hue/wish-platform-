"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AIRefinePreview } from "@/components/wish/ai-refine-preview";
import { Button } from "@/components/ui/button";
import { CategorySelector } from "@/components/wish/category-selector";
import { responseTypes } from "@/data/mock/wishes";
import { consumeSSEStream } from "@/lib/sse-parser";
import { cn } from "@/lib/utils";
import type { ResponseType, WishCategory } from "@/types";

const DRAFT_KEY = "wish-form-draft";
const DRAFT_SAVE_INTERVAL = 30000; // 30 seconds

const defaultRawWish =
  "我想发起一个每月一次的散步式读书会。不是正襟危坐地讨论一本书，而是大家带着最近读到的一段话，一边走一边聊。";

const defaultStructured = {
  title: "想做一个散步式读书会，让读书重新回到生活里",
  description:
    "我想发起一个每月一次的小型散步读书会。参与者不需要读同一本书，只需要带来最近打动自己的一段文字，在一段散步里慢慢交换。它更像一次轻的陪伴，而不是知识讨论活动。",
  whyImportant:
    "因为我发现，很多人想读书，却总在效率和输出里把阅读变成任务。我想给阅读找回一点松弛和人的连接。",
  currentBlocker:
    "我不知道第一场应该把人数控制在多少，也不知道怎样写邀请文字，才能让别人理解它不是活动策划，而是一种更柔和的相遇。",
  desiredResponseTypes: ["Advice", "Support", "Opportunity"] as ResponseType[],
};

interface FormErrors {
  title?: string;
  description?: string;
  whyImportant?: string;
  currentBlocker?: string;
  responseTypes?: string;
}

interface TouchedFields {
  title?: boolean;
  description?: boolean;
  whyImportant?: boolean;
  currentBlocker?: boolean;
}

interface DraftData {
  rawWish: string;
  title: string;
  description: string;
  whyImportant: string;
  currentBlocker: string;
  selectedTypes: ResponseType[];
  selectedCategory: WishCategory;
  allowAnonymous: boolean;
  allowPlatformSupport: boolean;
  timestamp: number;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  showHint,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  showHint?: boolean;
  multiline?: boolean;
  maxLength?: number;
}) {
  const className = cn(
    "mt-2 w-full rounded-[22px] border bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60",
    error && showHint
      ? "border-red-400 focus:border-red-500"
      : "border-line",
  );

  const charCount = value.length;

  return (
    <div>
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink/68 dark:text-ink-light/68">{label}</span>
          {maxLength && (
            <span className={cn(
              "text-xs",
              charCount > maxLength * 0.9 ? "text-red-500" : "text-ink/40 dark:text-ink-light/40"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            className={className}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            rows={5}
            value={value}
          />
        ) : (
          <input
            className={className}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            value={value}
          />
        )}
      </label>
      {error && showHint && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className="flex w-full items-start justify-between gap-4 rounded-[24px] border border-line bg-white/80 p-4 text-left transition hover:border-clay/40 dark:bg-surface-dark dark:border-stone-700/60"
      onClick={() => onChange(!checked)}
      type="button"
    >
      <div>
        <p className="text-sm text-ink dark:text-ink-light">{label}</p>
        <p className="mt-1 text-sm leading-6 text-ink/58 dark:text-ink-light/58">{description}</p>
      </div>
      <span
        className={cn(
          "mt-1 flex h-7 w-12 rounded-full border p-1 transition",
          checked
            ? "justify-end border-ink bg-ink dark:border-ink-light dark:bg-ink-light"
            : "justify-start border-line bg-mist dark:border-stone-600 dark:bg-stone-700",
        )}
      >
        <span className="block h-5 w-5 rounded-full bg-white" />
      </span>
    </button>
  );
}

function AuthPrompt() {
  return (
    <div className="rounded-[28px] border border-line bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-8 text-center dark:from-amber-950/20 dark:to-orange-950/10 dark:border-stone-700/60">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
        <svg className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="font-serif text-2xl text-ink dark:text-ink-light">发布愿望需要先登录</h3>
      <p className="mt-3 max-w-md mx-auto text-sm leading-7 text-ink/66 dark:text-ink-light/66">
        登录后，你的愿望会被安全保存，你也可以随时回来查看它的状态和收到的回应。
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <Link href="/auth/signin">
          <Button size="lg">去登录</Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="lg" variant="secondary">注册账号</Button>
        </Link>
      </div>
    </div>
  );
}

export function WishForm() {
  const [rawWish, setRawWish] = useState(defaultRawWish);
  const [title, setTitle] = useState(defaultStructured.title);
  const [description, setDescription] = useState(defaultStructured.description);
  const [whyImportant, setWhyImportant] = useState(defaultStructured.whyImportant);
  const [currentBlocker, setCurrentBlocker] = useState(defaultStructured.currentBlocker);
  const [selectedTypes, setSelectedTypes] = useState<ResponseType[]>(
    defaultStructured.desiredResponseTypes,
  );
  const [selectedCategory, setSelectedCategory] = useState<WishCategory>("Life");
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [allowPlatformSupport, setAllowPlatformSupport] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refined, setRefined] = useState(true);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setIsAuthenticated(data.success && data.user !== null);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // 加载草稿
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft: DraftData = JSON.parse(saved);
        const hoursSinceSave = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
        if (hoursSinceSave < 72) { // 3天内有效
          setRawWish(draft.rawWish);
          setTitle(draft.title);
          setDescription(draft.description);
          setWhyImportant(draft.whyImportant);
          setCurrentBlocker(draft.currentBlocker);
          setSelectedTypes(draft.selectedTypes);
          setSelectedCategory(draft.selectedCategory);
          setAllowAnonymous(draft.allowAnonymous);
          setAllowPlatformSupport(draft.allowPlatformSupport);
          setRefined(false);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch {
      // 草稿解析失败，忽略
    }
  }, []);

  // 自动保存草稿
  useEffect(() => {
    const saveDraft = () => {
      const draft: DraftData = {
        rawWish,
        title,
        description,
        whyImportant,
        currentBlocker,
        selectedTypes,
        selectedCategory,
        allowAnonymous,
        allowPlatformSupport,
        timestamp: Date.now(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        // localStorage 不可用，忽略
      }
    };

    const interval = setInterval(saveDraft, DRAFT_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [rawWish, title, description, whyImportant, currentBlocker, selectedTypes, selectedCategory, allowAnonymous, allowPlatformSupport]);

  const validateField = useCallback((name: string, value: any): string | undefined => {
    switch (name) {
      case "title":
        if (!value || !value.trim()) return "标题不能为空";
        if (value.trim().length > 100) return "标题不能超过 100 个字符";
        if (value.trim().length < 5) return "标题至少需要 5 个字符";
        return undefined;
      case "description":
        if (!value || !value.trim()) return "描述不能为空";
        if (value.trim().length < 20) return "描述至少需要 20 个字符";
        if (value.trim().length > 1000) return "描述不能超过 1000 个字符";
        return undefined;
      case "whyImportant":
        if (!value || !value.trim()) return "此字段不能为空";
        if (value.trim().length < 10) return "至少需要 10 个字符";
        if (value.trim().length > 500) return "不能超过 500 个字符";
        return undefined;
      case "currentBlocker":
        if (!value || !value.trim()) return "此字段不能为空";
        if (value.trim().length < 10) return "至少需要 10 个字符";
        if (value.trim().length > 500) return "不能超过 500 个字符";
        return undefined;
      default:
        return undefined;
    }
  }, []);

  const handleFieldChange = useCallback((field: string, value: string) => {
    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "whyImportant":
        setWhyImportant(value);
        break;
      case "currentBlocker":
        setCurrentBlocker(value);
        break;
    }

    if (touched[field as keyof TouchedFields]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [touched, validateField]);

  const handleFieldBlur = useCallback((field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, [validateField]);

  const handleRefine = async () => {
    if (!rawWish.trim()) return;

    setIsRefining(true);
    setRefineError(null);
    setRefined(true);

    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawWish: rawWish.trim() }),
      });

      if (!res.ok) throw new Error("AI 整理失败");

      let fullContent = "";
      await consumeSSEStream(res, (content) => {
        fullContent += content;
      });

      const result = JSON.parse(fullContent);
      setTitle(result.title || "");
      setDescription(result.description || "");
      setWhyImportant(result.whyImportant || "");
      setCurrentBlocker(result.currentBlocker || "");
      setTouched({});
      setErrors({});
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "AI 整理失败，请稍后重试");
      if (!title.trim()) {
        setTitle("想把一个还没开始的念头，整理成可以被回应的愿望");
      }
      if (!description.trim()) {
        setDescription(rawWish.trim());
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ["title", "description", "whyImportant", "currentBlocker"];
    const newErrors: FormErrors = {};
    const newTouched: TouchedFields = {
      title: true,
      description: true,
      whyImportant: true,
      currentBlocker: true,
    };

    fieldsToValidate.forEach((field) => {
      let value: string;
      switch (field) {
        case "title": value = title; break;
        case "description": value = description; break;
        case "whyImportant": value = whyImportant; break;
        case "currentBlocker": value = currentBlocker; break;
        default: value = "";
      }
      const error = validateField(field, value);
      if (error) newErrors[field as keyof FormErrors] = error;
    });

    if (selectedTypes.length === 0) {
      newErrors.responseTypes = "请至少选择一种你希望得到的回应类型";
    }

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors).find(Boolean);
      if (firstError) {
        setSubmitError(firstError);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          whyImportant: whyImportant.trim(),
          currentBlocker: currentBlocker.trim(),
          desiredResponseTypes: selectedTypes,
          allowAnonymous,
          allowPlatformSupport,
          category: selectedCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "提交失败");
      }

      if (data.wish) {
        // 清除草稿
        localStorage.removeItem(DRAFT_KEY);
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/wishes/${data.wish.id}`);
        }, 1500);
      } else {
        setSubmitError("愿望创建成功，但无法跳转到详情页。");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "提交失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleType = (type: ResponseType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );

    if (touched.title) {
      if (selectedTypes.filter((t) => t !== type).length === 0) {
        setErrors((prev) => ({
          ...prev,
          responseTypes: "请至少选择一种你希望得到的回应类型",
        }));
      } else {
        setErrors((prev) => ({ ...prev, responseTypes: undefined }));
      }
    }
  };

  // 如果还没确定登录状态，显示加载
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink dark:border-ink-light/20 dark:border-t-ink-light" />
          <p className="mt-3 text-sm text-ink/60 dark:text-ink-light/60">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录提示
  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
      <div className="space-y-6">
        {showSuccess && (
          <div className="rounded-[28px] border border-green-200 bg-green-50/80 p-6 text-center dark:border-green-800/50 dark:bg-green-950/20">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-green-800 dark:text-green-300">愿望发布成功！</h3>
            <p className="mt-1 text-sm text-green-700/80 dark:text-green-400/80">正在跳转到愿望详情页...</p>
          </div>
        )}

        <div className="surface p-6 sm:p-7 dark:bg-surface-dark">
          <div className="flex items-center justify-between">
            <p className="eyebrow">第一步</p>
            {draftSaved && (
              <span className="text-xs text-ink/40 dark:text-ink-light/40">草稿已保存</span>
            )}
          </div>
          <h2 className="mt-2 font-serif text-3xl text-ink dark:text-ink-light">
            先把最原始的愿望写下来
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65 dark:text-ink-light/65">
            不用一次写得很完整。平台会先帮你把表达整理清楚，再决定要不要公开发布。
          </p>

          <label className="mt-6 block">
            <span className="text-sm text-ink/68 dark:text-ink-light/68">原始愿望</span>
            <textarea
              className="mt-2 min-h-[220px] w-full rounded-[26px] border border-line bg-white px-5 py-4 text-sm leading-8 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/35"
              onChange={(event) => {
                setRefined(false);
                setRawWish(event.target.value);
              }}
              placeholder="写下那件你总想做、却一直没真正开始的事。"
              value={rawWish}
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button disabled={isRefining || !rawWish.trim()} onClick={handleRefine}>
              {isRefining ? "AI 正在整理..." : "整理这段愿望"}
            </Button>
            <p className="text-sm text-ink/52">
              {isRefining
                ? "AI 正在帮你把愿望说得更准确，请稍候。"
                : "AI 辅助整理，帮助把一件重要的事说得更准确。"}
            </p>
          </div>
          {refineError && (
            <p className="mt-3 text-sm text-red-500">{refineError}</p>
          )}
        </div>

        <div className="surface p-6 sm:p-7 dark:bg-surface-dark">
          <p className="eyebrow">第二步</p>
          <h2 className="mt-2 font-serif text-3xl text-ink dark:text-ink-light">确认并编辑结构化内容</h2>
          <div className="mt-6 space-y-5">
            <Field
              label="标题"
              onChange={(v) => handleFieldChange("title", v)}
              onBlur={() => handleFieldBlur("title", title)}
              value={title}
              error={errors.title}
              showHint={touched.title}
              maxLength={100}
            />
            <Field
              label="愿望描述"
              multiline
              onChange={(v) => handleFieldChange("description", v)}
              onBlur={() => handleFieldBlur("description", description)}
              value={description}
              error={errors.description}
              showHint={touched.description}
              maxLength={1000}
            />
            <Field
              label="为什么这件事重要"
              multiline
              onChange={(v) => handleFieldChange("whyImportant", v)}
              onBlur={() => handleFieldBlur("whyImportant", whyImportant)}
              value={whyImportant}
              error={errors.whyImportant}
              showHint={touched.whyImportant}
              maxLength={500}
            />
            <Field
              label="当前卡点"
              multiline
              onChange={(v) => handleFieldChange("currentBlocker", v)}
              onBlur={() => handleFieldBlur("currentBlocker", currentBlocker)}
              value={currentBlocker}
              error={errors.currentBlocker}
              showHint={touched.currentBlocker}
              maxLength={500}
            />
          </div>
        </div>

        <div className="surface p-6 sm:p-7 dark:bg-surface-dark">
          <p className="eyebrow">第三步</p>
          <h2 className="mt-2 font-serif text-3xl text-ink dark:text-ink-light">告诉别人你需要怎样的帮助</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {responseTypes.map((type) => {
              const selected = selectedTypes.includes(type);

              return (
                <button
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    selected
                      ? "border-ink bg-ink text-white dark:border-ink-light dark:bg-ink-light dark:text-background-dark"
                      : "border-line bg-white/80 text-ink/70 hover:border-clay/50 hover:text-ink dark:bg-surface-dark dark:text-ink-light/70 dark:hover:text-ink-light",
                  )}
                  key={type}
                  onClick={() => toggleType(type)}
                  type="button"
                >
                  {type}
                </button>
              );
            })}
          </div>
          {errors.responseTypes && (
            <p className="mt-2 text-xs text-red-600">{errors.responseTypes}</p>
          )}

          <div className="mt-8">
            <CategorySelector
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          <div className="mt-8 space-y-4">
            <Toggle
              checked={allowAnonymous}
              description="公开后仅显示这是匿名愿望，不展示发布者姓名。"
              label="允许匿名发布"
              onChange={setAllowAnonymous}
            />
            <Toggle
              checked={allowPlatformSupport}
              description="少量愿望可能获得平台协助整理、牵线或推进。"
              label="允许平台参与推进"
              onChange={setAllowPlatformSupport}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line/70 pt-6">
            <div>
              <p className="max-w-xl text-sm leading-7 text-ink/56">
                确认内容无误后，点击发布。你的愿望将被公开，等待别人的回应。
              </p>
              {submitError && (
                <p className="text-red-500 text-sm mt-2">{submitError}</p>
              )}
            </div>
            <Button className="px-6" disabled={isSubmitting || showSuccess} onClick={handleSubmit}>
              {isSubmitting ? "正在发布..." : showSuccess ? "发布成功" : "发布这个愿望"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <AIRefinePreview
          currentBlocker={currentBlocker}
          description={description}
          desiredResponseTypes={selectedTypes}
          title={title}
          whyImportant={whyImportant}
        />

        <div className="surface p-6">
          <p className="text-sm text-clay">
            {refined ? "这会是别人首先看到的版本。" : "你修改了原始愿望，还没有重新整理。"}
          </p>
          <p className="mt-3 text-sm leading-7 text-ink/64">
            平台真正想做的，不是把愿望包装得更动人，而是让它更容易被理解、被回应、被推进。
          </p>
        </div>
      </div>
    </div>
  );
}
