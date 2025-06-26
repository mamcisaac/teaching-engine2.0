// Batch API endpoint for handling multiple requests in a single HTTP call
// Reduces network overhead and improves performance

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import axios from 'axios';

const router = Router();

// Schema for batch request
const batchRequestSchema = z.object({
  requests: z.array(z.object({
    id: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    url: z.string(),
    data: z.unknown().optional(),
    headers: z.record(z.string()).optional(),
  })).max(50), // Limit batch size to 50 requests
});

// Batch endpoint
router.post('/batch', authenticate, async (req: Request, res: Response) => {
  try {
    // Validate request
    const { requests } = batchRequestSchema.parse(req.body);
    
    // Process requests in parallel with concurrency limit
    const concurrencyLimit = 10;
    const results = [];
    
    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const batch = requests.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(async (request) => {
          try {
            // Build full URL
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const fullUrl = request.url.startsWith('http') 
              ? request.url 
              : `${baseUrl}${request.url}`;
            
            // Forward authentication
            const headers = {
              ...request.headers,
              'Authorization': req.headers.authorization,
              'Cookie': req.headers.cookie,
            };
            
            // Make internal request
            const response = await axios({
              method: request.method,
              url: fullUrl,
              data: request.data,
              headers,
              timeout: 30000, // 30 second timeout per request
              validateStatus: () => true, // Don't throw on any status
            });
            
            return {
              id: request.id,
              status: response.status,
              data: response.data,
            };
          } catch (error) {
            console.error(`Batch request ${request.id} failed:`, error);
            
            return {
              id: request.id,
              status: 500,
              data: null,
              error: error instanceof Error ? error.message : 'Request failed',
            };
          }
        })
      );
      
      results.push(...batchResults);
    }
    
    res.json({
      responses: results,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Batch processing error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid batch request',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        error: 'Batch processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

// Health check endpoint for batch service
router.get('/batch/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    maxBatchSize: 50,
    concurrencyLimit: 10,
  });
});

export default router;