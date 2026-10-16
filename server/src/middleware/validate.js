import { AppError } from './errorHandler.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => ({
          field: issue.path.slice(1).join('.'),
          message: issue.message
        }));

        throw new AppError('Validation failed on request parameters', 400, errorMessages);
      }

      // Replace with sanitized parsed data
      if (parsed.data.body) req.body = parsed.data.body;
      if (parsed.data.query) req.query = parsed.data.query;
      if (parsed.data.params) req.params = parsed.data.params;

      next();
    } catch (err) {
      next(err);
    }
  };
}
