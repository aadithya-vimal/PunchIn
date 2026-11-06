import React from 'react';

const Results = ({ results, onGetInsight, insight, isInsightLoading }) => {
  // Gracefully handle prop format whether passed as results or resultsData
  const data = results?.individualResults ? results : results?.resultsData;
  if (!data || !data.individualResults || data.individualResults.length === 0) return null;

  const { individualResults, summary, skippedSubjects = [] } = data;
  const isBunkMode = summary?.type === 'bunk';

  return (
    <div className="mt-6 pt-5 border-t border-white/10 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i className={`fas ${isBunkMode ? 'fa-calculator text-sky-400' : 'fa-graduation-cap text-emerald-400'}`}></i>
            Forecast Results
          </h3>
          <p className="text-xs text-white/50">Mathematical analysis based on your target attendance criteria</p>
        </div>

        {summary?.value !== null && summary?.value !== undefined && (
          <div className="apple-badge self-start sm:self-auto font-mono text-xs">
            <span className={isBunkMode ? 'text-sky-300' : 'text-emerald-300'}>
              Total {isBunkMode ? 'Bunkable' : 'Needed'}: {summary.value}
            </span>
          </div>
        )}
      </div>

      {/* Notice for subjects without recorded attendance */}
      {skippedSubjects.length > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
          <i className="fas fa-circle-info text-amber-400 mt-0.5 shrink-0"></i>
          <div>
            <span className="font-semibold text-white">Excluded unrecorded courses: </span>
            <span>
              {skippedSubjects.join(', ')} currently {skippedSubjects.length === 1 ? 'has' : 'have'} 0 total classes and {skippedSubjects.length === 1 ? 'was' : 'were'} excluded from calculations.
            </span>
          </div>
        </div>
      )}

      {/* Individual Result Cards */}
      <div className="space-y-3">
        {individualResults.map((result, idx) => {
          const { subjectName, attended, total, requiredPerc, classesNeeded, bunkableClasses, error, isUnrecorded } = result;

          if (isUnrecorded) {
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white/70">{subjectName}</h4>
                  <p className="text-[11px] text-white/40">No classes held yet (0/0)</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                  Not Started
                </span>
              </div>
            );
          }

          if (error) {
            return (
              <div key={idx} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center justify-between">
                <span className="font-semibold">{subjectName}:</span>
                <span>{error}</span>
              </div>
            );
          }

          const currentPct = total > 0 ? (attended / total) * 100 : 0;
          const isEligible = currentPct >= requiredPerc;

          return (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isBunkMode 
                  ? 'bg-sky-500/[0.04] border-sky-500/20' 
                  : 'bg-emerald-500/[0.04] border-emerald-500/20'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{subjectName}</h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isEligible 
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}>
                    {currentPct.toFixed(1)}% (Req: {requiredPerc}%)
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1 font-mono">
                  Attended {attended} of {total} lectures
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                {isBunkMode ? (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-sky-400/80 block">Safe Skips</span>
                    <span className="font-mono text-xl font-extrabold text-sky-300">
                      {bunkableClasses} {bunkableClasses === 1 ? 'class' : 'classes'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400/80 block">Required Attendance</span>
                    {classesNeeded === Infinity ? (
                      <span className="text-xs text-rose-400 font-semibold">Requirement cannot be met mathematically</span>
                    ) : classesNeeded > 0 ? (
                      <span className="font-mono text-xl font-extrabold text-amber-300">
                        {classesNeeded} {classesNeeded === 1 ? 'more class' : 'more classes'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 sm:justify-end">
                        <i className="fas fa-circle-check"></i> Safe (Criteria met)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Strategist Button & Container */}
      {onGetInsight && (
        <div className="mt-5 pt-4 border-t border-white/5">
          <button
            onClick={onGetInsight}
            disabled={isInsightLoading}
            className="apple-btn-secondary text-xs px-4 py-2 flex items-center gap-2 text-sky-300 border-sky-500/30 hover:bg-sky-500/10 disabled:opacity-50"
          >
            {isInsightLoading ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs"></i>
                <span>Generating Academic Insight...</span>
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles text-xs"></i>
                <span>Get AI Strategic Analysis</span>
              </>
            )}
          </button>

          {insight && (
            <div className="mt-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-white/80 leading-relaxed prose-apple">
              <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
                <i className="fas fa-robot text-xs"></i> AI Planner Recommendation
              </div>
              <p>{insight}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
