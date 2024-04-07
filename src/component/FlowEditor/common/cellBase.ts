export interface IBasicData {
  label: string;
  trigger?: string;
  jobStatus?: 'success' | 'fail' | 'running' | 'ready' | 'upChangeSuccess';
  collapsed?: boolean;
  expandSize?: { width: number; height: number };
  weight?: number;
}
export interface INodeStatus {
  jobStatus?: 'success' | 'fail' | 'running' | 'ready' | 'upChangeSuccess';
  isFocus: boolean;
  nodeStatusSnapshot: Record<string, any>;
}
