export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message = `API request failed with status ${status}`,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
