type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export function PagePlaceholder({
  title,
  description = "Content for this route will be added next.",
}: PagePlaceholderProps) {
  return (
    <main className="px-4 py-8 md:px-6 md:py-10">
      <div className="light-element dark-element relative rounded-[24px] p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.55px] text-[#637083]">
          FairGambling
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#2a274e] dark:text-white md:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#2a274e]/60 dark:text-white/50">
          {description}
        </p>
      </div>
    </main>
  );
}
