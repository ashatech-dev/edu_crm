class AppError extends Error {
  public status_code: number;
  public application_code: number;

  constructor(message: string, status_code?: number, application_code?: number) {
    super(message);
    this.status_code = status_code || 500;
    this.application_code = application_code || status_code || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
