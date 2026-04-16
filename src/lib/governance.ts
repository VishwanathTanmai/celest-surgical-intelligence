import { prisma } from "./db";

export type Action = "CREATE" | "READ" | "UPDATE" | "DELETE";
export type Resource = "CASE" | "PATIENT" | "INVENTORY" | "USER" | "HOSPITAL";

export interface UserSession {
  id: string;
  role: string;
  hospitalId: string;
  roleId?: string | null;
}

export class GovernanceEngine {
  /**
   * Validates if a user has permission to perform an action on a resource.
   * Supports both Legacy Roles (ADMIN/DOCTOR) and Fine-Grained RBAC Roles.
   */
  static async can(user: UserSession, action: Action, resource: Resource): Promise<boolean> {
    // 1. Root Admin Bypass (Total Governance)
    if (user.role === "ADMIN") return true;

    // 2. Fetch Fine-Grained Permissions if available
    let permissions: string[] = [];
    
    if (user.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: user.roleId }
      });
      if (role) {
        try {
          permissions = JSON.parse(role.permissions);
        } catch (e) {
          console.error("Governance: Failed to parse role permissions", e);
        }
      }
    }

    // 3. Permission Key mapping: "resource:action" (e.g., "case:create")
    const permissionKey = `${resource.toLowerCase()}:${action.toLowerCase()}`;
    
    if (permissions.includes(permissionKey)) return true;

    // 4. Default Legacy Doctor Mapping
    if (user.role === "DOCTOR") {
      const doctorDefaults: Record<Resource, Action[]> = {
        "CASE": ["CREATE", "READ", "UPDATE"],
        "PATIENT": ["READ", "CREATE"],
        "INVENTORY": ["READ"],
        "USER": ["READ"],
        "HOSPITAL": ["READ"]
      };
      
      return doctorDefaults[resource]?.includes(action) || false;
    }

    return false;
  }

  /**
   * Resolves if a user can access a specific hospital based on Multi-Institutional Hierarchy.
   */
  static async canAccessHospital(user: UserSession, targetHospitalId: string): Promise<boolean> {
    // Direct Access
    if (user.hospitalId === targetHospitalId) return true;

    // Hierarchy Check (Recursive Parent-to-Child)
    const hierarchy = await GovernanceEngine.getHospitalFamily(user.hospitalId);
    return hierarchy.includes(targetHospitalId);
  }

  private static async getHospitalFamily(parentId: string): Promise<string[]> {
    const subs = await prisma.hospital.findMany({
      where: { parentId },
      select: { id: true }
    });

    const subIds = subs.map(s => s.id);
    let allIds = [...subIds];

    for (const id of subIds) {
      const recursiveIds = await GovernanceEngine.getHospitalFamily(id);
      allIds = [...allIds, ...recursiveIds];
    }

    return allIds;
  }
}
