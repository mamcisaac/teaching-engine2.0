import type { Response } from 'express';

import { logger } from '../logger';

// Standard response types
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface PaginatedResponse<T = unknown> extends SuccessResponse<T[]> {
  meta: {
    timestamp: string;
    requestId?: string;
    pagination: {
      page: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface CreatedResponse<T = unknown> extends SuccessResponse<T> {
  meta: {
    timestamp: string;
    requestId?: string;
    location?: string;
  };
}

// Response builders
export const successResponse = <T>(
  data: T,
  meta?: Omit<SuccessResponse['meta'], 'timestamp'>
): SuccessResponse<T> => ({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });

export const paginatedResponse = <T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number,
  meta?: Record<string, unknown>
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  };
};

export const createdResponse = <T>(
  data: T,
  location?: string,
  meta?: Record<string, unknown>
): CreatedResponse<T> => ({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      location,
      ...meta,
    },
  });

// Response senders
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): void => {
  const response = successResponse(data, {
    requestId: res.locals.requestId as string | undefined,
    ...meta,
  });
  
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  location?: string,
  meta?: Record<string, unknown>
): void => {
  const response = createdResponse(data, location, {
    requestId: res.locals.requestId as string | undefined,
    ...meta,
  });
  
  if (location) {
    res.setHeader('Location', location);
  }
  
  res.status(201).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number,
  meta?: Record<string, unknown>
): void => {
  const response = paginatedResponse(data, page, pageSize, totalItems, {
    requestId: res.locals.requestId as string | undefined,
    ...meta,
  });
  
  res.status(200).json(response);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

export const sendAccepted = <T>(
  res: Response,
  data?: T,
  meta?: Record<string, unknown>
): void => {
  if (data) {
    sendSuccess(res, data, 202, meta);
  } else {
    res.status(202).json({
      success: true,
      message: 'Request accepted for processing',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId as string | undefined,
        ...meta,
      },
    });
  }
};

// Utility response helpers
export const sendFile = (
  res: Response,
  filePath: string,
  filename?: string,
  contentType?: string
): void => {
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }
  
  if (filename) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }
  
  res.sendFile(filePath, (err) => {
    if (err !== null) {
      logger.error({ error: err, filePath }, 'Failed to send file');
      res.status(500).json({
        success: false,
        error: {
          code: 'FILE_SEND_ERROR',
          message: 'Failed to send file',
        },
      });
    }
  });
};

export const sendJSON = (
  res: Response,
  data: unknown,
  filename = 'data.json'
): void => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(data, null, 2));
};

export const sendCSV = (
  res: Response,
  csvContent: string,
  filename = 'data.csv'
): void => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
};

// Cache control helpers
export const setCacheHeaders = (
  res: Response,
  maxAge = 300, // 5 minutes default
  isPrivate = true
): void => {
  const cacheControl = isPrivate
    ? `private, max-age=${maxAge}`
    : `public, max-age=${maxAge}`;
  
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('ETag', `"${Date.now()}"`);
};

export const setNoCacheHeaders = (res: Response): void => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};