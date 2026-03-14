export default function SystemQuestionsPanel({ data, onJumpToSection }) {
  const questions = Array.isArray(data?.systemQuestions) ? data.systemQuestions.filter((q) => q?.question && q?.answer) : []

  if (questions.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-6 mt-6 mb-8" aria-labelledby="system-questions-heading" id="system-questions">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 id="system-questions-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white">
            System Questions
          </h2>
          <span className="text-[10px] tracking-[0.18em] uppercase text-cyan-200/80">Quick answers + jump links</span>
        </div>

        <div className="space-y-3">
          {questions.map((entry, index) => (
            <article key={`${entry.question}-${index}`} className="rounded-lg border border-white/10 bg-[#090b14] px-4 py-3">
              <h3 className="text-xs md:text-sm text-white font-semibold leading-relaxed">{entry.question}</h3>
              <p className="text-[11px] md:text-xs text-gray-300 leading-relaxed mt-1.5">{entry.answer}</p>
              {typeof entry.tabIndex === 'number' && (
                <button
                  onClick={() => onJumpToSection(entry.tabIndex, entry.sectionId)}
                  className="mt-2 text-[10px] uppercase tracking-[0.15em] text-cyan-300 hover:text-cyan-200"
                >
                  Open {entry.tabLabel || 'section'}
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
