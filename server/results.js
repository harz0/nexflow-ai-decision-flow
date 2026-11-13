
const pendingResults = new Map();

export function createPendingResult(requestId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingResults.delete(requestId);
      reject(new Error("AI decision timed out"));
    }, 60000);

    pendingResults.set(requestId, (result, error) => {
      clearTimeout(timeout);
      pendingResults.delete(requestId);

      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
    });
  });
}

export function resolvePendingResult(requestId, result, error) {
  const resolve = pendingResults.get(requestId);

  if (resolve) {
    resolve(result, error);
  }
}
