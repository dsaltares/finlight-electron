/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    appApi: IElectronAPI;
  }
}

export type IpcRequest = {
  body: any;
  headers: any;
  method: string;
  url: string;
};

export type IpcResponse = {
  body: any;
  headers: any;
  status: number;
};

export interface IElectronAPI {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  trpc: (req: IpcRequest) => Promise<IpcResponse>;
}
