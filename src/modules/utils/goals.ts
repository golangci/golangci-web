export default function reachGoal(category: string, action: string, label?: string, value?: any) {
  if (typeof window == "undefined") {
    return;
  }

  console.log('reachGoal: category="%s", action="%s", label="%s", value=%s',
    category, action, label, value
  );

  let w = window as any;
  if (w.yaCounter42654659 !== undefined) {
    let yaGoalName = category + '.' + action;
    w.yaCounter42654659.reachGoal(yaGoalName, function () {
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
}
