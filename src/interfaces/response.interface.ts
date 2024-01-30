export interface IResponse {
  status: number;
  body: {
    message?: string;
    data?: object | string;
    srt?: any;
    error?: object | string;
  };
}
