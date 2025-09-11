import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
}

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Operation successful',
    statusCode: HttpStatus = HttpStatus.OK
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(
    data: T,
    message: string = 'Resource created successfully'
  ): ApiResponse<T> {
    return this.success(data, message, HttpStatus.CREATED);
  }

  static updated<T>(
    data: T,
    message: string = 'Resource updated successfully'
  ): ApiResponse<T> {
    return this.success(data, message, HttpStatus.OK);
  }

  static deleted(
    message: string = 'Resource deleted successfully'
  ): ApiResponse<null> {
    return this.success(null, message, HttpStatus.OK);
  }

  static error(
    message: string = 'Operation failed',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ): ApiResponse<null> {
    return {
      success: false,
      message,
      data: null,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}