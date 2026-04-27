import { notFound } from "next/navigation";

import { wishes } from "@/data/mock/wishes";
import { getResponsesByWishId, getWishById } from "@/lib/wishes";
import { formatDate } from "@/lib/utils";
import { ResponseForm } from "@/components/response/response-form";
import { ResponseCard } from "@/components/response/response-card";
import { ResponseTypeBadge } from "@/components/response/response-type-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ProgressTimeline } from "@/components/wish/progress-timeline";
import { WishStatusBadge } from "@/components/wish/wish-status-badge";
import { WishManagementPanel } from "@/components/wish/wish-management-panel";
import { MessageWishOwnerButton } from "@/components/wish/message-wish-owner-button";

export async function generateStaticParams() {
  return wishes.map((wish) => ({
    id: wish.id,
  }));
}

export default async function WishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wish = await getWishById(id);

  if (!wish) {
    notFound();
  }

  const wishResponses = await getResponsesByWishId(wish.id);
  const platformSupportLabel = wish.allowPlatformSupport
    ? "平台愿意在它足够清楚时，尝试陪它往前推进一步。"
    : "这个愿望目前主要依靠社区回应，不由平台主动推进。";
  const responseInvitation = wish.allowAnonymous
    ? "如果你愿意，也可以用匿名方式提供帮助。"
    : "这个愿望更适合以真实身份被回应和连接。";

  return (
    <div className="pb-20">
      <section className="relative min-h-[50vh] overflow-hidden px-4 pb-12 pt-10 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-4%] top-12 h-72 w-72 rounded-full bg-[#edd9c0]/32 blur-[120px] dark:bg-clay/8" />
          <div className="absolute right-[6%] top-8 h-80 w-80 rounded-full bg-[#f6e8d3]/38 blur-[130px] dark:bg-clay/6" />
          <div className="absolute left-[38%] top-44 h-60 w-60 rounded-full bg-[#fff6ea]/82 blur-[100px] dark:bg-clay/4" />
        </div>

        <div className="mx-auto flex min-h-[40vh] max-w-5xl flex-col items-center justify-center text-center">
          <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/34 dark:text-ink-light/40">
              {wish.allowAnonymous
                ? "来自：一个选择匿名的人"
                : wish.originLabel
                  ? `来自：${wish.originLabel}`
                  : "来自：一个还不愿把梦说得太响亮的人"}
            </p>
            <h1 className="font-serif text-[2rem] leading-[1.12] tracking-[-0.04em] text-ink sm:text-[3.2rem] sm:leading-[1.1] lg:text-[4.8rem] lg:leading-[1.08] dark:text-ink-light">
              {wish.title}
            </h1>
            <p className="mx-auto max-w-3xl font-serif text-base leading-[1.75] text-ink/68 sm:text-[1.2rem] sm:leading-[1.8] lg:text-[1.55rem] dark:text-ink-light/65">
              {wish.summary}
            </p>
          </div>
        </div>
      </section>

      <div className="page-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-10 sm:space-y-12">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <section className="rounded-[24px] bg-stone-100/75 p-5 sm:p-8 dark:bg-surface-dark">
              <p className="eyebrow">愿望背景</p>
              <p className="mt-3 text-sm leading-7 text-ink/74 sm:leading-8 dark:text-ink-light/70">{wish.description}</p>
            </section>

            <section className="rounded-[24px] bg-stone-100/75 p-5 sm:p-8 dark:bg-surface-dark">
              <p className="eyebrow">为何重要</p>
              <p className="mt-3 text-sm leading-7 text-ink/74 sm:leading-8 dark:text-ink-light/70">{wish.whyImportant}</p>
            </section>
          </div>

          <section className="rounded-[24px] bg-rose-50/80 p-5 sm:p-8 dark:bg-rose-900/15">
            <p className="eyebrow">当前卡点</p>
            <p className="mt-3 text-sm leading-7 text-ink/74 sm:leading-8 dark:text-ink-light/70">{wish.currentBlocker}</p>
          </section>

          <section className="space-y-3 border-t border-stone-200 pt-6 sm:space-y-4 sm:border-t-0 sm:pt-8 dark:border-stone-700/50">
            <p className="eyebrow">这件事现在最需要什么</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {wish.desiredResponseTypes.map((type) => (
                <ResponseTypeBadge key={type} type={type} />
              ))}
            </div>
          </section>

          {wish.allowPlatformSupport ? (
            <section className="space-y-4 sm:space-y-5">
              <div className="max-w-2xl">
                <p className="eyebrow">官方推进线</p>
                <h2 className="mt-2 font-serif text-2xl leading-[1.2] sm:text-3xl sm:leading-[1.16] lg:text-4xl text-ink dark:text-ink-light">
                  从愿望，到现实里的一小步。
                </h2>
                <p className="mt-2 text-sm leading-7 text-ink/60 sm:mt-3 dark:text-ink-light/55">
                  平台不会替人完成梦想，但会在合适的时候，帮忙把第一步接到地面上。
                </p>
              </div>
              <ProgressTimeline updates={wish.progressUpdates} />
            </section>
          ) : null}

          <section className="space-y-6 border-t border-stone-200 pt-8 sm:space-y-7 sm:pt-10 dark:border-stone-700/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
              <div className="max-w-2xl">
                <p className="eyebrow">回声区</p>
                <h2 className="mt-1 font-serif text-2xl leading-[1.2] sm:mt-2 sm:text-3xl sm:leading-[1.16] lg:text-4xl text-ink dark:text-ink-light">
                  收到的 {wish.responseCount} 份回声 / 帮助
                </h2>
                <p className="mt-2 text-sm leading-7 text-ink/60 sm:mt-3 dark:text-ink-light/55">
                  每一份回声都不是围观，而是在回答同一个问题：我能为这个愿望补上什么。{responseInvitation}
                </p>
              </div>
              <ButtonLink href="/submit" variant="secondary">
                我也想提供帮助
              </ButtonLink>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {wishResponses.map((response) => (
                <ResponseCard key={response.id} wishId={wish.id} response={response} />
              ))}
            </div>

            <ResponseForm wishId={wish.id} />
          </section>
        </section>

        <aside className="space-y-6 sm:space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] bg-stone-100/75 p-5 sm:p-7 dark:bg-surface-dark">
            <p className="eyebrow">愿望此刻</p>
            <div className="mt-5 space-y-5 text-sm text-ink/68 dark:text-ink-light/60">
              <div>
                <p className="text-ink/46 dark:text-ink-light/45">状态</p>
                <div className="mt-2">
                  <WishStatusBadge status={wish.status} />
                </div>
              </div>
              <div>
                <p className="text-ink/46 dark:text-ink-light/45">分类</p>
                <div className="mt-2">
                  <Badge tone="soft">{wish.category}</Badge>
                </div>
              </div>
              <div>
                <p className="text-ink/46 dark:text-ink-light/45">收到的回应</p>
                <p className="mt-2 font-serif text-3xl text-ink dark:text-ink-light">{wish.responseCount}</p>
              </div>
              <div className="border-t border-stone-200 pt-4 dark:border-stone-700/50">
                <p className="text-ink/46 dark:text-ink-light/45">发布方式</p>
                <div className="mt-2 flex items-center gap-2">
                  {wish.allowAnonymous ? (
                    <>
                      <span className="rounded-full border border-clay/40 bg-sand/30 px-2 py-0.5 text-[10px] tracking-[0.06em] text-clay dark:bg-clay/10 dark:border-clay/30">匿名发布</span>
                      <p className="text-ink/62 dark:text-ink-light/55">发布者选择了匿名</p>
                    </>
                  ) : (
                    <p className="text-ink/62 dark:text-ink-light/55">实名发布</p>
                  )}
                </div>
              </div>
              <div className="border-t border-stone-200 pt-4 dark:border-stone-700/50">
                <p className="text-ink/46 dark:text-ink-light/45">平台是否参与推进</p>
                <p className="mt-2 leading-7 text-ink/62 dark:text-ink-light/55">{platformSupportLabel}</p>
              </div>
              <div className="border-t border-stone-200 pt-4 dark:border-stone-700/50">
                <p className="text-ink/46 dark:text-ink-light/45">记录起始于</p>
                <p className="mt-2 text-ink dark:text-ink-light">{formatDate(wish.createdAt)}</p>
              </div>
            </div>
          </div>

          <WishManagementPanel wish={wish} />

          {wish.originLabel && (
            <MessageWishOwnerButton 
              wishId={wish.id} 
              wishOwnerId={wish.originLabel} 
            />
          )}
        </aside>
      </div>
    </div>
  );
}
