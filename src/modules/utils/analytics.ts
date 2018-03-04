import { IUser } from "../auth";

function getWindowProperty(name: string): any {
  if (typeof window == "undefined") {
    return null;
  }

  let w = window as any;
  if (!w[name]) {
    return null;
  }

  return w[name];
}

export default function reachGoal(category: string, action: string, label?: string, value?: any) {
  let counter = getWindowProperty("yaCounter47296422");
  if (counter) {
    console.log('reachGoal: category="%s", action="%s", label="%s", value=%s',
      category, action, label, value
    );

    let yaGoalName = category + '.' + action;
    counter.reachGoal(yaGoalName, function () {
      console.log('yandex goal "%s" was sent', yaGoalName);
    });
  }

  let ga = getWindowProperty("ga");
  if (ga) {
    ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
    });
    console.log('sent goal to google');
  }
}

export function trackEvent(text: string): void {
  let mp = getWindowProperty("mixpanel");
  if (!mp) {
    return;
  }

  mp.track(text);
  console.debug("tracked event '%s'", text);
}

export function trackAuthorizedUser(user: IUser): void {
  let mp = getWindowProperty("mixpanel");
  if (!mp) {
    return;
  }

  mp.identify(user.id.toString());
  let u = {
      "$first_name": user.name,
      "$created": user.createdAt,
      "$email": user.email,
      "GithubLogin": user.githubLogin,
  };
  mp.people.set(u);
  console.info("tracked user login:", u);
}

export function reportError(e: any, data?: any): void {
  let rb = getWindowProperty("Rollbar");
  if (!rb) {
    return;
  }

  rb.error(e, data);
  console.debug("sent error to rollbar", e);
}
