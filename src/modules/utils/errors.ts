export function reportError(e: any, data?: any): void {
  try {
    if (typeof window == "undefined") {
      return;
    }

    let w = window as any;
    if (w.Rollbar === undefined) {
      console.warn("try to report error: no rollbar js", e);
      return;
    }

    w.Rollbar.error(e, data);
    console.debug("sent error to rollbar", e);
  } catch (ex) {
    console.error("exception in reportError:", ex);
  }
}
