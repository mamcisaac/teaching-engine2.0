# Curriculum Outcome Embeddings Service

## Overview

The Embedding Service provides semantic vector embeddings for curriculum outcomes using OpenAI's text-embedding-3-small model. These embeddings enable intelligent features like outcome clustering, similarity search, and semantic curriculum mapping.

## Features

- **Automatic Embedding Generation**: Generate embeddings for all curriculum outcomes
- **Caching**: Embeddings are stored in the database to avoid redundant API calls
- **Batch Processing**: Efficient batch processing with rate limiting
- **Similarity Search**: Find semantically similar outcomes
- **Text-based Search**: Search outcomes using natural language queries
- **Admin Protection**: Embedding generation requires admin authentication

## Configuration

### Required Environment Variables

```bash
# OpenAI API key for generating embeddings
OPENAI_API_KEY=your_openai_api_key

# Admin token for protected endpoints
WIZARD_TOKEN=your_secure_admin_token_here
```

## API Endpoints

### 1. Get Service Status
```
GET /api/embeddings/status
```

Returns the current status of the embedding service and statistics.

**Response:**
```json
{
  "available": true,
  "totalOutcomes": 1000,
  "embeddedOutcomes": 800,
  "missingEmbeddings": 200,
  "model": "text-embedding-3-small"
}
```

### 2. Generate Missing Embeddings (Admin)
```
POST /api/embeddings/generate
Authorization: Bearer {WIZARD_TOKEN}
```

Generates embeddings for all outcomes that don't have them yet.

**Request Body:**
```json
{
  "forceRegenerate": false  // Optional: regenerate all embeddings
}
```

**Response:**
```json
{
  "generated": 200,
  "message": "Successfully generated 200 embeddings"
}
```

### 3. Find Similar Outcomes
```
GET /api/embeddings/similar/{outcomeId}?limit=10
```

Finds outcomes similar to a given outcome based on embedding similarity.

**Response:**
```json
{
  "results": [
    {
      "outcome": {
        "id": "outcome-2",
        "code": "M3.2",
        "description": "Count by 2s, 5s, and 10s",
        "subject": "Mathematics",
        "grade": 3
      },
      "similarity": 0.95
    }
  ]
}
```

### 4. Search by Text
```
POST /api/embeddings/search
```

Search for outcomes using natural language.

**Request Body:**
```json
{
  "query": "counting and number patterns",
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "outcome": {
        "id": "outcome-1",
        "code": "M3.1",
        "description": "Count to 100 by 1s",
        "subject": "Mathematics",
        "grade": 3
      },
      "similarity": 0.88
    }
  ]
}
```

### 5. Generate Embedding for Specific Outcome (Admin)
```
POST /api/embeddings/outcome/{outcomeId}
Authorization: Bearer {WIZARD_TOKEN}
```

Generate or regenerate embedding for a specific outcome.

## Database Schema

### OutcomeEmbedding Model

```prisma
model OutcomeEmbedding {
  id          String   @id @default(cuid())
  outcomeId   String   @unique
  outcome     Outcome  @relation(fields: [outcomeId], references: [id])
  embedding   String   // JSON array of floats
  model       String   // "text-embedding-3-small"
  dimensions  Int      // 1536
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([outcomeId])
}
```

## Usage in Code

### Generate Embeddings Programmatically

```typescript
import { generateMissingEmbeddings } from './services/embeddingService';

// Generate embeddings for all outcomes without embeddings
const count = await generateMissingEmbeddings();
console.log(`Generated ${count} embeddings`);

// Force regenerate all embeddings
const allCount = await generateMissingEmbeddings(true);
```

### Find Similar Outcomes

```typescript
import { findSimilarOutcomes } from './services/embeddingService';

// Find 5 most similar outcomes
const similar = await findSimilarOutcomes('outcome-id', 5);
similar.forEach(({ outcome, similarity }) => {
  console.log(`${outcome.code}: ${outcome.description} (${similarity})`);
});
```

### Search by Text

```typescript
import { searchOutcomesByText } from './services/embeddingService';

// Search for outcomes matching a query
const results = await searchOutcomesByText('problem solving with fractions', 10);
```

## Technical Details

### Embedding Generation Process

1. **Text Preparation**: Outcomes are converted to rich text format including subject, grade, code, description, and domain
2. **API Call**: Text is sent to OpenAI's embedding API
3. **Storage**: 1536-dimensional vectors are stored as JSON in the database
4. **Caching**: Existing embeddings are reused unless force regeneration is requested

### Similarity Calculation

The service uses cosine similarity to compare embeddings:
- Range: -1 to 1 (higher is more similar)
- Typical threshold for "similar": > 0.7
- Identical texts: ~1.0

### Rate Limiting

- Maximum 5 concurrent requests to OpenAI API
- Batch size: 100 outcomes per batch
- Small delay between batches to avoid rate limits

## Integration with Phase 5 Features

The embedding service is a foundational component for:

1. **Curriculum Intelligence**: Clustering outcomes into logical milestones
2. **Smart Suggestions**: Finding related outcomes for activity planning
3. **Semantic Search**: Natural language curriculum exploration
4. **Outcome Mapping**: Understanding relationships between outcomes

## Performance Considerations

- Initial embedding generation: ~1-2 seconds per 100 outcomes
- Similarity search: < 100ms for 1000 outcomes
- Text search: ~500ms (includes embedding generation)

## Troubleshooting

### Service Not Available
- Check OPENAI_API_KEY is set correctly
- Verify API key has access to embedding models

### Slow Performance
- Check database indexes are created
- Consider reducing batch size for rate limit issues
- Monitor OpenAI API usage and limits

### Missing Embeddings
- Run `/api/embeddings/generate` endpoint
- Check for outcomes added after last generation
- Verify no API errors in logs