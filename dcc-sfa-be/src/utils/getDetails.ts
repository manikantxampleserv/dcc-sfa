import prisma from '../configs/prisma.client';

const getRequestDetailsByType = async (
  request_type: string,
  reference_id: number | null
): Promise<any> => {
  if (!reference_id) {
    return null;
  }

  try {
    switch (request_type) {
      case 'ORDER_APPROVAL':
        const order = await prisma.orders.findUnique({
          where: { id: reference_id },
          select: {
            id: true,
            order_number: true,
            parent_id: true,
            total_amount: true,
            status: true,
            order_date: true,
            delivery_date: true,
            payment_method: true,
            notes: true,
            orders_customers: {
              select: {
                id: true,
                name: true,
                code: true,
                phone_number: true,
              },
            },
            orders_salesperson_users: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (order) {
          return {
            order_number: order.order_number || 'N/A',
            customer_name: order.orders_customers?.name || 'N/A',
            customer_code: order.orders_customers?.code || 'N/A',
            customer_phone: order.orders_customers?.phone_number || 'N/A',
            salesperson_name: order.orders_salesperson_users?.name || 'N/A',
            salesperson_email: order.orders_salesperson_users?.email || 'N/A',
            total_amount: `₹${order.total_amount?.toString() || '0'}`,
            order_date: order.order_date
              ? new Date(order.order_date).toLocaleDateString('en-IN')
              : 'N/A',
            delivery_date: order.delivery_date
              ? new Date(order.delivery_date).toLocaleDateString('en-IN')
              : 'N/A',
            payment_method: order.payment_method || 'N/A',
            status: order.status || 'PENDING',
            notes: order.notes || 'No additional notes',
          };
        }
        return null;

      default:
        console.log(`⚠ No handler for request_type: ${request_type}`);
        return {
          message: `Request type '${request_type}' is not yet implemented`,
          reference_id,
        };
    }
  } catch (error: any) {
    console.error('Error in getRequestDetailsByType:', error);
    return {
      error: 'Failed to fetch request details',
      message: error.message,
    };
  }
};

export default getRequestDetailsByType;
