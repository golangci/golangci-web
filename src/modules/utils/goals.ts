export default function reachGoal(category: string, action: string, label?: string, value?: any) {
  try {
    if (typeof window == "undefined") {
      return;
    }

    console.log('reachGoal: category="%s", action="%s", label="%s", value=%s',
      category, action, label, value
    );

    let w = window as any;
    if (w.yaCounter47296422 !== undefined) {
      let yaGoalName = category + '.' + action;
      w.yaCounter47296422.reachGoal(yaGoalName, function () {
        console.log('yandex goal "%s" was sent', yaGoalName);
      });
    }

    if (w.ga !== undefined) {
      w.ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
        eventValue: value,
      });
      console.log('sent goal to google');
    }
  } catch (ex) {
    console.error("exception in reachGoal:", ex);
  }
}

export function trackEvent(text: string): void {
  try {
    if (typeof window == "undefined") {
      return;
    }

    let w = window as any;
    if (w.mixpanel === undefined) {
      console.warn("try to track event '%s': no mixpanel js", text);
      return;
    }

    w.mixpanel.track(text);
    console.debug("tracked event '%s'", text);
  } catch (ex) {
    console.error("exception in trackEvent:", ex);
  }
}
