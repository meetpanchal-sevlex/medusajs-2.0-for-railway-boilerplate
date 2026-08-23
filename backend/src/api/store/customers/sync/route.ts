import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const authModuleService = req.scope.resolve(Modules.AUTH);
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    
    // In Medusa V2, authenticated requests have the auth identity ID in req.auth_context
    const authIdentityId = req.auth_context?.auth_identity_id || req.auth_context?.actor_id;
    
    if (!authIdentityId) {
      return res.status(401).json({ message: "Unauthorized - No auth context found" });
    }

    const authIdentity = await authModuleService.retrieveAuthIdentity(authIdentityId);
    
    // Extract data from Google provider metadata
    const providerData = authIdentity.provider_metadata || {};
    const appData = authIdentity.app_metadata || {};
    
    const email = (appData.email || providerData.email || "").toString();
    const first_name = (appData.first_name || providerData.given_name || providerData.name || "Valued").toString();
    const last_name = (appData.last_name || providerData.family_name || "Customer").toString();

    if (!email) {
      return res.status(400).json({ message: "No email found in auth identity" });
    }

    // Check if customer exists
    let customers = await customerModuleService.listCustomers({ email });
    
    if (customers.length === 0) {
      // Create customer
      const newCustomer = await customerModuleService.createCustomers({
        email,
        first_name,
        last_name,
      });
      return res.json({ customer: newCustomer });
    }

    return res.json({ customer: customers[0] });
  } catch (error: any) {
    console.error("Sync Customer Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
