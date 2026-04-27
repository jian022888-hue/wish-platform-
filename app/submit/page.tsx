import { WishForm } from "@/components/wish/wish-form";

export default function SubmitPage() {
  return (
    <div className="page-shell py-10 sm:py-14">
      <section className="mb-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="eyebrow">发布愿望</p>
          <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.2] text-ink dark:text-ink-light sm:text-5xl">
            这里允许你认真地
            <br />
            写下一件真正重要的事
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-8 text-ink/66 dark:text-ink-light/66">
          你不需要一开始就表达得完美。先把那件一直在心里、却还没真正开始的事写下来，平台会帮你整理成一个更容易被理解和回应的版本。
        </p>
      </section>

      <WishForm />
    </div>
  );
}
