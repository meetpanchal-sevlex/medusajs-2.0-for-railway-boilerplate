import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import crypto from "crypto";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not set.");
      return res.status(400).send("Webhook secret missing.");
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay Webhook Signature");
      return res.status(400).send("Invalid signature");
    }

    const body = req.body as any;
    const event = body?.event;
    console.log("Razorpay Webhook Received:", event);
    
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = body?.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      
      const query = req.scope.resolve("query");
      const completeCartWorkflow = req.scope.resolve("completeCartWorkflow");

      // 1. Find the payment session matching the Razorpay Order ID
      const { data: paymentSessions } = await query.graph({
        entity: "payment_session",
        fields: ["id", "payment_collection_id", "data"],
      });

      const matchingSession = paymentSessions.find(
        (ps: any) => ps.data?.id === rzpOrderId || ps.data?.order_id === rzpOrderId
      );

      if (!matchingSession) {
        console.error(`No Payment Session found for Razorpay Order ID: ${rzpOrderId}`);
        return res.status(404).send("Payment Session not found");
      }

      // 2. Find the Cart associated with this Payment Collection
      const { data: carts } = await query.graph({
        entity: "cart",
        fields: ["id", "payment_collection_id"],
        filters: {
          payment_collection_id: matchingSession.payment_collection_id
        }
      });

      const cart = carts[0];
      
      if (!cart) {
        console.error(`No Cart found for Payment Collection ID: ${matchingSession.payment_collection_id}`);
        return res.status(404).send("Cart not found");
      }

      console.log(`Completing Cart ${cart.id} via Razorpay Webhook...`);

      // 3. Complete the Cart (creates Order)
      try {
        await completeCartWorkflow(req.scope).run({
          input: { id: cart.id },
        });
        console.log(`Cart ${cart.id} successfully completed via Webhook.`);
      } catch (err: any) {
        // If the cart was already completed (e.g. by the frontend), it might throw an error.
        // We log it but still return 200 to Razorpay so it doesn't retry endlessly.
        console.log(`Cart completion skipped/failed (might already be completed): ${err.message}`);
      }
    }

    res.status(200).send("OK");
  } catch (err: any) {
    console.error("Razorpay Webhook Error:", err.message);
    res.status(500).send("Webhook Error");
  }
}
