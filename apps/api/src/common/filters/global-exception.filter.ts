import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || JSON.stringify(responseBody);
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const prismaError = exception as { code?: string; message?: string };
      if (prismaError.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Record already exists';
      } else if (prismaError.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        message = prismaError.message || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    response.status(status).json({
      success: false,
      data: null,
      message,
      statusCode: status,
    });
  }
}
