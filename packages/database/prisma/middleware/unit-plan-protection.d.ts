import { Prisma } from '@prisma/client';
/**
 * Prisma middleware to protect locked unit plans from modifications
 */
export declare const unitPlanProtectionMiddleware: Prisma.Middleware;
/**
 * Add a unit plan ID to the protection list
 */
export declare function addProtectedUnitPlan(unitId: string): void;
/**
 * Remove a unit plan ID from the protection list (admin only)
 */
export declare function removeProtectedUnitPlan(unitId: string): boolean;
/**
 * Get list of protected unit plan IDs
 */
export declare function getProtectedUnitPlans(): string[];
/**
 * Check if a unit plan is protected
 */
export declare function isUnitPlanProtected(unitId: string): boolean;
/**
 * Bulk lock multiple unit plans
 */
export declare function bulkLockUnitPlans(prisma: any, unitIds: string[], reason: string): Promise<{
    success: boolean;
    lockedCount: any;
    timestamp: Date;
    reason: string;
}>;
export default unitPlanProtectionMiddleware;
//# sourceMappingURL=unit-plan-protection.d.ts.map