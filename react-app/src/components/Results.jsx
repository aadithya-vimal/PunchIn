import React from 'react';

const Results = ({ resultsData }) => {
  if (!resultsData || resultsData.individualResults.length === 0) return null;

  const { individualResults, summary } = resultsData;
  const isBunkMode = summary.type === 'bunk';

  const Card = ({ result }) => {
    const { subjectName, classesNeeded, bunkableClasses } = result;
    if (result.error) return <div className="p-4 bg-red-500/20 rounded-lg"><strong>{subjectName}:</strong> {result.error}</div>;

    if (isBunkMode) {
      return (
        <div className="p-4 bg-white/10 rounded-lg">
          <h3 className="font-bold">{subjectName}</h3>
          <p>You can safely bunk <span className="font-bold text-xl text-blue-300">{bunkableClasses}</span> class(es).</p>
        </div>
      );
    }
    // Attend Mode
    return (
      <div className="p-4 bg-white/10 rounded-lg">
        <h3 className="font-bold">{subjectName}</h3>
        {classesNeeded === Infinity ? <p>Target is impossible to reach.</p> :
         classesNeeded > 0 ? <p>You need to attend <span className="font-bold text-xl text-green-300">{classesNeeded}</span> more class(es).</p> :
         <p>You are safe!</p>
        }
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="space-y-4">
        {individualResults.map((result, index) => <Card key={index} result={result} />)}
        {summary.value !== null && (
          <div className={`p-6 mt-6 rounded-lg text-center ${isBunkMode ? 'bg-blue-500/30' : 'bg-indigo-500/30'}`}>
            <h3 className="text-xl font-bold mb-2">Total Summary</h3>
            <p className="mb-3">Total classes:</p>
            <div className="text-5xl font-bold text-white">{summary.value}</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Results;