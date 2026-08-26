import { ModuleProvider, Modules, PaymentSessionStatus } from "@medusajs/framework/utils"
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import Razorpay from "razorpay"

class CustomRazorpayProvider extends AbstractPaymentProvider {
  static identifier = "razorpay"
  protected razorpay: Razorpay
  
  constructor(_, options: any) {
    super(_, options)
    this.razorpay = new Razorpay({
      key_id: options.key_id,
      key_secret: options.key_secret
    })
  }
  
  async initiatePayment(input: any): Promise<any> {
    try {
      // In Medusa 2.0, amount is often a BigNumber object. Convert to string first.
      const amount = Math.round(Number(String(input.amount))) * 100
      
      const order = await this.razorpay.orders.create({
        amount: amount,
        currency: input.currency_code?.toUpperCase() || "INR",
        receipt: "receipt_" + Date.now()
      })
      
      return { 
        id: order.id, 
        data: { id: order.id, ...order } 
      }
    } catch (e: any) {
      console.error("Razorpay Initiate Error Details:", JSON.stringify(e, null, 2))
      console.error("Razorpay Error Message:", e.message)
      console.error("Razorpay Input Received:", JSON.stringify(input, null, 2))
      throw new Error(e.message || "Unknown Razorpay Error")
    }
  }
  
  async authorizePayment(input: any): Promise<any> {
    return { data: input.data, status: "authorized" as any }
  }
  
  async updatePayment(input: any): Promise<any> {
    return { data: input.data }
  }
  
  async cancelPayment(input: any): Promise<any> {
    return { data: input.data }
  }
  
  async capturePayment(input: any): Promise<any> {
    return { data: input.data }
  }
  
  async refundPayment(input: any): Promise<any> {
    return { data: input.data }
  }
  
  async getPaymentStatus(input: any): Promise<any> {
    return { status: "authorized" as any }
  }
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [CustomRazorpayProvider],
})
