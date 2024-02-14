export interface IResponse {
  status: number;
  data?: any;
  error?: any;
  body?: {
    message?: string;
    data?: object | string;
    srt?: any;
    error?: object | string;
  };
}
