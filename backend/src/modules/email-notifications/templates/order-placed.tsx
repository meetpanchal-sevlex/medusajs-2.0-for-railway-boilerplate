import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary?: { raw_current_order_total?: { value: number }; total?: number } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Your LaundryMall order has been confirmed!' }) => {
  const orderTotal = (order as any).total || order.summary?.total || order.summary?.raw_current_order_total?.value || 0
  const orderNumber = order.display_id || (order as any).id?.slice(-6) || 'New'
  const items = (order as any).items || []

  return (
    <Base preview={preview}>
      <Section style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ backgroundColor: '#f43397', padding: '20px', borderRadius: '12px 12px 0 0', textAlign: 'center' }}>
          <Text style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '0.5px' }}>
            LaundryMall
          </Text>
          <Text style={{ color: '#ffffff', opacity: 0.9, fontSize: '12px', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            B2B Commercial Laundry & Dry Cleaning Supplies
          </Text>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px' }}>
            Order Confirmed! 🎉
          </Text>

          <Text style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 20px', lineHeight: '1.5' }}>
            Hello {shippingAddress?.first_name ? `${shippingAddress.first_name}` : 'Valued Customer'}, thank you for shopping with LaundryMall. We are currently packing your items and will notify you as soon as your shipment is on the way.
          </Text>

          {/* Order Info Box */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', margin: '0 0 20px', border: '1px solid #f3f4f6' }}>
            <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>
              <strong>Order ID:</strong> #{orderNumber}
            </Text>
            <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>
              <strong>Order Date:</strong> {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            <Text style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
              <strong>Total Amount:</strong> <span style={{ color: '#f43397', fontWeight: 'bold', fontSize: '16px' }}>₹{Number(orderTotal).toFixed(0)}</span>
            </Text>
          </div>

          {/* Items Table */}
          <Text style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: '0 0 10px' }}>
            Items Ordered
          </Text>
          <div style={{ width: '100%', border: '1px solid #f3f4f6', borderRadius: '8px', overflow: 'hidden', margin: '0 0 20px' }}>
            {items.map((item: any, idx: number) => (
              <div 
                key={item.id || idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 16px', 
                  borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f3f4f6',
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {item.title || item.product_title || 'Product'}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                    Qty: {item.quantity}
                  </Text>
                </div>
                <Text style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  ₹{(Number(item.unit_price || 0) * (item.quantity || 1)).toFixed(0)}
                </Text>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          {shippingAddress?.address_1 && (
            <>
              <Text style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px' }}>
                Delivery Address
              </Text>
              <Text style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.4' }}>
                {shippingAddress.first_name} {shippingAddress.last_name}<br />
                {shippingAddress.address_1}<br />
                {shippingAddress.city}, {shippingAddress.province} - {shippingAddress.postal_code}<br />
                Phone: {shippingAddress.phone || 'N/A'}
              </Text>
            </>
          )}

          <Hr style={{ margin: '24px 0', borderColor: '#eaeaea' }} />

          <Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
            Need help with your order? Contact us at support@laundrymall.in<br />
            © {new Date().getFullYear()} LaundryMall. All rights reserved.
          </Text>
        </div>
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: '1',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'INR',
    items: [
      { id: 'item-1', title: 'Commercial Laundry Detergent 20L', quantity: 2, unit_price: 965 },
    ],
    summary: { raw_current_order_total: { value: 1930 } }
  },
  shippingAddress: {
    first_name: 'Meet',
    last_name: 'Panchal',
    address_1: 'Plot 42, GIDC Industrial Estate',
    city: 'Ahmedabad',
    province: 'Gujarat',
    postal_code: '382445',
    country_code: 'IN',
    phone: '9876543210'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate

