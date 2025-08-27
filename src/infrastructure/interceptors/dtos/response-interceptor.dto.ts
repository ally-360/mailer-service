export class ResponseDto<T> {
  success: boolean;
  data: T;

  constructor(data: T) {
    this.success = true;
    this.data = data;
  }
}
