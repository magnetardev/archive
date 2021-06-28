var initArchivePromise = undefined;
var initArchive = (config) => {
  if (initArchivePromise) return initArchivePromise;
  initArchivePromise = new Promise(function (resolve, reject) {
    var Module = typeof config !== "undefined" ? config : {};
    var originalOnAbortFunction = Module["onAbort"];

    Module["onAbort"] = (errorThatCausedAbort) => {
      reject(new Error(errorThatCausedAbort));
      if (originalOnAbortFunction)
        originalOnAbortFunction(errorThatCausedAbort);
    };

    Module["postRun"] = Module["postRun"] || [];
    Module["postRun"].push(() => resolve(Module));
    module = undefined;
//   });
// };
