import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import Razorpay from "razorpay"

class CustomRazorpayProvider extends AbstractPaymentProvider {
  static identifier = "razorpay"
  protected razorpay: Razorpay
  
  constructor(_, options: any) {
    super(_, options)
    const key_id = options?.key_id || process.env.RAZORPAY_ID || ""
    const key_secret = options?.key_secret || process.env.RAZORPAY_SECRET || ""
    this.razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    })
  }
  
  async initiatePayment(input: any): Promise<any> {
    try {
      console.log("Razorpay initiatePayment called with input:", JSON.stringify(input, null, 2))
      const rawAmount = input?.amount !== undefined ? input.amount : (input?.data?.amount || 0)
      const amount = Math.round(Number(String(rawAmount))) * 100
      const currency = (input?.currency_code || input?.data?.currency_code || "INR").toUpperCase()
      
      const order = await this.razorpay.orders.create({
        amount: amount > 0 ? amount : 100,
        currency: currency,
        receipt: "rcpt_" + Date.now()
      })
      
      console.log("Razorpay Order Created Successfully:", order.id)
      
      const keyId = (this.razorpay as any)?.key_id || process.env.RAZORPAY_ID || ""
      return { 
        id: order.id, 
        data: { id: order.id, key_id: keyId, ...order },
        status: "pending" as any
      }
    } catch (e: any) {
      console.error("Razorpay Initiate Error Details:", JSON.stringify(e, null, 2))
      console.error("Razorpay Error Message:", e.message)
      console.error("Razorpay Input Received:", JSON.stringify(input, null, 2))
      throw new Error(e.message || "Unknown Razorpay Error")
    }
  }
  
  async authorizePayment(input: any): Promise<any> {
    return { data: input?.data || {}, status: "authorized" as any }
  }
  
  async updatePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async cancelPayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async deletePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async capturePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async refundPayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async retrievePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async getPaymentStatus(input: any): Promise<any> {
    return { status: "authorized" as any }
  }
  
  async getWebhookActionAndData(payload: any): Promise<any> {
    return {
      action: "not_supported",
      data: {
        session_id: "",
        amount: 0
      }
    }
  }
}

class CustomManualProvider extends AbstractPaymentProvider {
  static identifier = "manual"
  
  constructor(_, options: any) {
    super(_, options)
  }
  
  async initiatePayment(input: any): Promise<any> {
    return {
      id: "manual_" + Date.now(),
      data: { id: "manual_" + Date.now() },
      status: "pending" as any
    }
  }
  
  async authorizePayment(input: any): Promise<any> {
    return { data: input?.data || {}, status: "authorized" as any }
  }
  
  async updatePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async cancelPayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async deletePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async capturePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async refundPayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async retrievePayment(input: any): Promise<any> {
    return { data: input?.data || {} }
  }
  
  async getPaymentStatus(input: any): Promise<any> {
    return { status: "authorized" as any }
  }
  
  async getWebhookActionAndData(payload: any): Promise<any> {
    return {
      action: "not_supported",
      data: {
        session_id: "",
        amount: 0
      }
    }
  }
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [CustomRazorpayProvider, CustomManualProvider],
})
