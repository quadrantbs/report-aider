export const formatReport = (report) => {
  const formattedDate = new Date(report.reportDate).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const formattedCC = report.cc
    .map((cc) => cc || "-")
    .reduce((acc, curr, index, array) => {
      if (index === 0) {
        return curr;
      } else if (index === array.length - 1) {
        return `${acc} dan ${curr}`;
      } else {
        return `${acc}, ${curr}`;
      }
    }, "");

  const formattedSources = report.source
    .map((src) => `${src.name || "-"} (${src.position || "-"})`)
    .reduce((acc, curr, index, array) => {
      if (index === 0) {
        return curr;
      } else if (index === array.length - 1) {
        return `${acc} dan ${curr}`;
      } else {
        return `${acc}, ${curr}`;
      }
    }, "");

  const sourcesText =
    report.source.length > 1
      ? report.source
          .map((src, index) => {
            const details =
              report.details[index]
                ?.map(
                  (detail, subIndex) =>
                    `\t${String.fromCharCode(97 + subIndex)}. ${detail}`
                )
                .join("\n") || "";

            return `${index + 1}. ${src.name} (${
              src.position
            }) mengatakan sbb:\n${details}`;
          })
          .join("\n\n")
      : report.details[0]
          ?.map((detail, index) => `${index + 1}. ${detail}`)
          .join("\n\n") || "";

  return `*Kepada : Yth. ${report.to}*
*Tembusan : Yth. ${formattedCC}*
*Dari : ${report.from}*
*Bidang : ${report.field}*
*Kode :* ${report.code}
*Perihal: ${report.subject}.*

_____________________

Pada ${formattedDate}, di ${
    report.areaOfReport
  }, telah diperoleh informasi dari ${formattedSources} terkait ${
    report.subject
  }. Adapun kesimpulan yakni ${
    report.twoSentencesConclusion
  }. Selengkapnya dilaporkan sbb:

${sourcesText}

_*Catatan :*_

_1. ${report.notesRecap || "-"}_

_2. ${report.notesToDo || "-"}_

_3. Korwil akan terus melakukan monitor terhadap ${
    report.notesMonitoring || "-"
  } di ${report.areaOfReport}._

*DUMP*`;
};

export const FormattedReport = ({ report, inDetails = false }) => {
  if (inDetails) {
    return (
      <div className="whitespace-pre-wrap mb-24">{formatReport(report)}</div>
    );
  }  
  return (
    <>
      <button
        onClick={() => document.getElementById("preview").showModal()}
        className="float-right bottom-5 right-2 md:right-1/4 btn btn-info sticky"
      >
        Preview
      </button>
      <dialog id="preview" className="modal">
        <div className="modal-box md:mx-auto md:w-2/3 max-w-full">
          <div className="modal-action mt-0">
            <button
              onClick={() => document.getElementById("preview").close()}
              className="btn btn-error btn-xs mb-2"
            >
              ✖
            </button>
          </div>
          <div className="h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap">{formatReport(report)}</div>
          </div>
        </div>
      </dialog>
    </>
  );
};
