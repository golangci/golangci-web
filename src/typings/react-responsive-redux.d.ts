declare module "react-responsive-redux" {
  export function setMobileDetect(md: any): any;
  export function mobileParser(req: any): any;

  export const reducer: any;

  export class MobileScreen extends React.Component<any> {}
  export class DesktopScreen extends React.Component<any> {}
}
