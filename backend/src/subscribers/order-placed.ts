import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
    
    const order: any = await orderModuleService.retrieveOrder(data.id, { 
      relations: ['items', 'summary', 'shipping_address'] 
    })
    
    if (!order || !order.email) {
      console.log(`[OrderPlacedNotification] No recipient email found for order ${data.id}`)
      return
    }

    const shippingAddress = order.shipping_address || {}
    const orderNumber = order.display_id || order.id.slice(-6)

    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: process.env.RESEND_FROM_EMAIL || 'support@laundrymall.in',
          subject: `Order Confirmed #${orderNumber} - LaundryMall`
        },
        order,
        shippingAddress,
        preview: `Your LaundryMall order #${orderNumber} has been placed successfully!`
      }
    })
    console.log(`[OrderPlacedNotification] Confirmation email queued for order #${orderNumber} to ${order.email}`)
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}

