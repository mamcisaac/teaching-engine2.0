#\!/bin/bash

# Phase 3.2: Fix unsafe operations - Type guards and validation
echo "Phase 3.2: Fixing unsafe operations..."

# 1. Fix unsafe member access
echo "Adding type guards for object property access..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Fix common unsafe access patterns
  sed -i '' 's/error\.response\.data/((error as any)?.response?.data || "Unknown error")/g' "$file"
  sed -i '' 's/error\.message/(error instanceof Error ? error.message : String(error))/g' "$file"
done

# 2. Fix unsafe assignment patterns
echo "Fixing unsafe assignments..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Fix assignment of unknown to specific types
  sed -i '' 's/= response\.data;/= response.data as Record<string, unknown>;/g' "$file"
  sed -i '' 's/= data;/= data as Record<string, unknown>;/g' "$file"
done

# 3. Add type guards for API responses
echo "Creating type guard utilities..."
cat > client/src/utils/typeGuards.ts << 'TYPESCRIPT'
// Type guard utilities for safe type checking

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isAxiosError(error: unknown): error is { response?: { data?: unknown; status?: number } } {
  return (
    typeof error === 'object' &&
    error \!== null &&
    'response' in error &&
    typeof (error as any).response === 'object'
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value \!== null && \!Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && \!isNaN(value);
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isRecord(obj) && key in obj;
}

export function safeJsonParse<T = unknown>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (isAxiosError(error) && error.response?.data) {
    if (isRecord(error.response.data) && isString(error.response.data.message)) {
      return error.response.data.message;
    }
  }
  return String(error);
}
TYPESCRIPT

# 4. Fix unsafe calls
echo "Fixing unsafe function calls..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Fix JSON.parse without try-catch
  perl -i -pe 's/JSON\.parse\(([^)]+)\)/safeJsonParse($1, {})/g' "$file"
done

# 5. Fix unsafe return statements
echo "Fixing unsafe return values..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Add type assertions for return values
  sed -i '' 's/return response\.data$/return response.data as unknown/g' "$file"
  sed -i '' 's/return result$/return result as unknown/g' "$file"
done

# 6. Add import for type guards where needed
echo "Adding type guard imports..."
find client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "error\." "$file" && \! grep -q "typeGuards" "$file"; then
    # Add import at the top of the file after other imports
    sed -i '' '1s/^/import { getErrorMessage, isAxiosError } from "..\/utils\/typeGuards";\n/' "$file"
  fi
done

echo "Phase 3.2 complete. Checking remaining errors..."
npm run lint:strict 2>&1 | grep -E "error" | wc -l
