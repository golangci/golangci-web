import { IUser } from "modules/auth";

function getWindowProperty(name: string): any {
  if (typeof window === "undefined") {
    return null;
  }

  const w = window as any;
  if (!w[name]) {
    return null;
  }

  return w[name];
}

export default function reachGoal(category: string, action: string, label?: string, value?: any) {
  const counter = getWindowProperty("yaCounter47296422");
  if (counter) {
    console.log('reachGoal: category="%s", action="%s", label="%s", value=%s',
      category, action, label, value,
    );

    const yaGoalName = category + "." + action;
    counter.reachGoal(yaGoalName, () => {
      console.log('yandex goal "%s" was sent', yaGoalName);
    });
  }

  const ga = getWindowProperty("ga");
  if (ga) {
    ga("send", {
      hitType: "event",
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
    });
    console.log("sent goal to google");
  }
}

export function trackEvent(text: string, payload?: object): void {
  const mp = getWindowProperty("mixpanel");
  if (mp) {
    mp.track(text, payload);
    console.debug("tracked event '%s' into mixpanel", text);
  }

  const amplitude = getWindowProperty("amplitude");
  if (amplitude) {
    amplitude.getInstance().logEvent(text, payload);
    console.debug("tracked event '%s' into amplitude", text);
  }
}

export function trackAuthorizedUser(user: IUser): void {
  const mp = getWindowProperty("mixpanel");
  if (mp) {
    mp.identify(user.id.toString());
    const u = {
        $first_name: user.name,
        $email: user.email,
        GithubLogin: user.githubLogin,
    };
    mp.people.set(u);
    console.info("tracked user login to mixpanel:", u);
  }

  const amplitude = getWindowProperty("amplitude");
  if (amplitude) {
    const ai = amplitude.getInstance();
    ai.setUserId(user.id.toString());
    const userProperties = {
        name: user.name,
        email: user.email,
        githubLogin: user.githubLogin,
    };
    ai.setUserProperties(userProperties);
    console.info("tracked user login to amplitude:", user);
  }

  const rb = getWindowProperty("Rollbar");
  if (rb) {
    const p = {
      id: user.id,
      username: user.githubLogin,
      email: user.email,
    };
    rb.configure({
      payload: {
        person: p,
      },
    });
    console.info("tracked user login to rollbar:", p);
  }
}

export function reportError(e: any, data?: any): void {
  const rb = getWindowProperty("Rollbar");
  if (!rb) {
    return;
  }

  rb.error(e, data);
  console.debug("sent error to rollbar", e);
}
