import { Prisma } from '@prisma/client';

// List of unit plan IDs that are protected (will be populated after locking)
const PROTECTED_UNIT_PLAN_IDS = new Set<string>();

// Error messages for different protection scenarios
const PROTECTION_ERRORS = {
  LOCKED_UNIT: (id: string) => 
    `🔒 PROTECTED: Unit plan ${id} is locked and cannot be modified. ` +
    `See UNIT_PLANS_PROTECTION_PROTOCOL.md for override procedures.`,
  
  CANNOT_UNLOCK: (id: string) =>
    `🔒 SECURITY: Cannot remove protection from unit plan ${id}. ` +
    `This requires administrative approval.`,
    
  BULK_PROTECTION_VIOLATION: () =>
    `🔒 BULK PROTECTION: Cannot perform bulk operations on protected unit plans. ` +
    `Individual unit modifications require proper authorization.`
};

/**
 * Prisma middleware to protect locked unit plans from modifications
 */
export const unitPlanProtectionMiddleware: Prisma.Middleware = async (params, next) => {
  const { model, action, args } = params;

  // Only apply to UnitPlan operations
  if (model !== 'UnitPlan') {
    return next(params);
  }

  // Operations that modify data
  const WRITE_OPERATIONS = ['create', 'update', 'upsert', 'delete', 'updateMany', 'deleteMany'];
  
  if (!WRITE_OPERATIONS.includes(action)) {
    return next(params);
  }

  try {
    // Handle single unit operations
    if (['update', 'upsert', 'delete'].includes(action)) {
      const unitId = args?.where?.id;
      
      if (unitId) {
        // Check if unit is locked in database
        const unit = await next({
          ...params,
          model: 'UnitPlan',
          action: 'findUnique',
          args: {
            where: { id: unitId },
            select: { isLocked: true, title: true }
          }
        });

        if (unit?.isLocked) {
          // Special case: Allow unlocking only with specific override
          if (action === 'update' && 
              args?.data?.isLocked === false && 
              process.env.OVERRIDE_UNIT_PROTECTION === 'true') {
            console.warn(`⚠️ OVERRIDE: Unlocking unit plan ${unitId} with administrative override`);
            return next(params);
          }

          // Prevent any other modifications to locked units
          if (action === 'update' && args?.data?.isLocked !== undefined) {
            throw new Error(PROTECTION_ERRORS.CANNOT_UNLOCK(unitId));
          }

          throw new Error(PROTECTION_ERRORS.LOCKED_UNIT(unitId));
        }
      }
    }

    // Handle bulk operations (more restrictive)
    if (['updateMany', 'deleteMany'].includes(action)) {
      // For bulk operations, we need to check if any targeted units are locked
      const whereClause = args?.where || {};
      
      // Get potentially affected units
      const affectedUnits = await next({
        ...params,
        model: 'UnitPlan',
        action: 'findMany',
        args: {
          where: whereClause,
          select: { id: true, isLocked: true, title: true }
        }
      });

      const lockedUnits = affectedUnits.filter((unit: any) => unit.isLocked);
      
      if (lockedUnits.length > 0) {
        const lockedIds = lockedUnits.map((unit: any) => unit.id).join(', ');
        console.error(`🔒 Bulk operation blocked - ${lockedUnits.length} locked units affected: ${lockedIds}`);
        throw new Error(PROTECTION_ERRORS.BULK_PROTECTION_VIOLATION());
      }
    }

    // Handle create operations (should be allowed, but log for auditing)
    if (action === 'create') {
      const isLocked = args?.data?.isLocked;
      if (isLocked) {
        console.log(`🔒 Creating new locked unit plan: ${args?.data?.title || 'Untitled'}`);
      }
    }

    return next(params);

  } catch (error) {
    // Log security violations for auditing
    console.error(`🚨 UNIT PLAN PROTECTION VIOLATION:`, {
      action,
      model,
      args: JSON.stringify(args, null, 2),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    throw error;
  }
};

/**
 * Add a unit plan ID to the protection list
 */
export function addProtectedUnitPlan(unitId: string) {
  PROTECTED_UNIT_PLAN_IDS.add(unitId);
  console.log(`🔒 Added unit plan ${unitId} to protection list`);
}

/**
 * Remove a unit plan ID from the protection list (admin only)
 */
export function removeProtectedUnitPlan(unitId: string) {
  if (process.env.OVERRIDE_UNIT_PROTECTION === 'true') {
    PROTECTED_UNIT_PLAN_IDS.delete(unitId);
    console.warn(`⚠️ OVERRIDE: Removed unit plan ${unitId} from protection list`);
    return true;
  }
  
  console.error(`🚨 UNAUTHORIZED: Attempt to remove protection from ${unitId} without override`);
  return false;
}

/**
 * Get list of protected unit plan IDs
 */
export function getProtectedUnitPlans(): string[] {
  return Array.from(PROTECTED_UNIT_PLAN_IDS);
}

/**
 * Check if a unit plan is protected
 */
export function isUnitPlanProtected(unitId: string): boolean {
  return PROTECTED_UNIT_PLAN_IDS.has(unitId);
}

/**
 * Bulk lock multiple unit plans
 */
export async function bulkLockUnitPlans(prisma: any, unitIds: string[], reason: string) {
  const timestamp = new Date();
  
  try {
    // Update all specified units to locked status
    const result = await prisma.unitPlan.updateMany({
      where: {
        id: { in: unitIds }
      },
      data: {
        isLocked: true,
        lockedAt: timestamp,
        lockedReason: reason
      }
    });

    // Add to protection list
    unitIds.forEach(id => addProtectedUnitPlan(id));

    console.log(`🔒 Successfully locked ${result.count} unit plans`);
    console.log(`🔒 Reason: ${reason}`);
    console.log(`🔒 Timestamp: ${timestamp.toISOString()}`);

    return {
      success: true,
      lockedCount: result.count,
      timestamp,
      reason
    };

  } catch (error) {
    console.error(`❌ Failed to bulk lock unit plans:`, error);
    throw new Error(`Failed to lock unit plans: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default unitPlanProtectionMiddleware;