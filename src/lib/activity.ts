import prisma from '@/lib/prisma'

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  entityName: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
      },
    })
  } catch (error) {
    // Activity logging is non-critical — don't throw
    console.error('Failed to log activity:', error)
  }
}
