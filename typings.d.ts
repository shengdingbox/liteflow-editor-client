declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

declare interface LogicComponentMeta {
  label: string;
  type: string;
}

declare interface LogicComponent {
  meta: LogicComponentMeta;
  node: any;
  view: any;
  disabled?: boolean;
}
