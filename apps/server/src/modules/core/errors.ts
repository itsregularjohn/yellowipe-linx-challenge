export class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Not Found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
