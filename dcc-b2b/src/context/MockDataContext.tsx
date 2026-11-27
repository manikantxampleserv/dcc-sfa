import dayjs from 'dayjs';
import type {
  Delivery,
  ReturnRequest,
  ReturnStatus,
} from 'mock/data/deliveries';
import { mockDeliveries, mockReturns } from 'mock/data/deliveries';
import type { Invoice, Payment, PaymentMethod } from 'mock/data/invoices';
import { mockInvoices, mockPayments } from 'mock/data/invoices';
import type {
  Feedback,
  Issue,
  IssuePriority,
  IssueType,
} from 'mock/data/issues';
import { mockFeedback, mockIssues } from 'mock/data/issues';
import type { Order, OrderItem, OrderStatus } from 'mock/data/orders';
import { mockOrders } from 'mock/data/orders';
import type { Product } from 'mock/data/products';
import { mockProducts } from 'mock/data/products';
import React, { createContext, useContext } from 'react';
import { useSessionStorage } from '../hooks/useSessionStorage';

/** Session storage key constants */
export const STORAGE_KEYS = {
  ORDERS: 'b2b_orders',
  INVOICES: 'b2b_invoices',
  PAYMENTS: 'b2b_payments',
  DELIVERIES: 'b2b_deliveries',
  RETURNS: 'b2b_returns',
  ISSUES: 'b2b_issues',
  FEEDBACK: 'b2b_feedback',
  PRODUCTS: 'b2b_products',
} as const;

/** Context state and methods interface */
export interface MockDataContextType {
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  deliveries: Delivery[];
  returns: ReturnRequest[];
  issues: Issue[];
  feedback: Feedback[];
  products: Product[];

  /** Order operations */
  getOrderById: (id: number | string) => Order | undefined;
  createOrder: (orderInput: {
    customer_name: string;
    customer_sap_code: string;
    items: OrderItem[];
    notes?: string;
    delivery_date?: string;
    status?: OrderStatus;
  }) => Order;
  updateOrderStatus: (
    orderId: number,
    status: OrderStatus,
    meta?: {
      approved_by?: string;
      rejection_reason?: string;
      delivery_date?: string;
      notes?: string;
    }
  ) => Order | undefined;
  updateOrderItems: (orderId: number, items: OrderItem[]) => Order | undefined;
  deleteOrder: (orderId: number) => void;
  approveOrder: (orderId: number, approverName?: string) => Order | undefined;
  rejectOrder: (orderId: number, reason: string) => Order | undefined;

  /** Invoice & Payment operations */
  recordPayment: (
    invoiceNumber: string,
    amount: number,
    method: PaymentMethod,
    reference: string,
    confirmedBy?: string
  ) => Payment;

  /** Delivery operations */
  updateDelivery: (
    id: number,
    patch: Partial<Delivery>
  ) => Delivery | undefined;
  scheduleDelivery: (data: {
    orderNumber: string;
    scheduled_date: string;
    scheduled_time_slot?: string;
    driver_name: string;
    driver_phone: string;
    vehicle_plate: string;
    delivery_address?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
  }) => Delivery | undefined;
  executeDelivery: (
    orderId: number,
    podData?: {
      pod_lat?: number;
      pod_lng?: number;
      notes?: string;
      pod_image?: string;
    }
  ) => Delivery | undefined;
  createReturn: (
    returnData: Omit<ReturnRequest, 'id' | 'created_at'>
  ) => ReturnRequest;
  updateReturnStatus: (
    id: number,
    status: ReturnStatus,
    resolutionNotes?: string
  ) => ReturnRequest | undefined;

  /** Issue & Feedback operations */
  createIssue: (data: {
    orderNumber: string;
    type: IssueType;
    priority?: IssuePriority;
    subject: string;
    description: string;
    assigned_to?: string;
  }) => Issue;
  updateIssue: (id: number, patch: Partial<Issue>) => Issue | undefined;
  createFeedback: (data: {
    rating: number;
    delivery_rating?: number;
    product_quality_rating?: number;
    comment: string;
    order_number?: string;
  }) => Feedback;

  /** Reset whole database to mock seed data */
  resetDatabase: () => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(
  undefined
);

/**
 * Provider that manages real-time persistent data in sessionStorage for DCC B2B
 */
export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders, removeOrders] = useSessionStorage<Order[]>(
    STORAGE_KEYS.ORDERS,
    mockOrders
  );
  const [invoices, setInvoices, removeInvoices] = useSessionStorage<Invoice[]>(
    STORAGE_KEYS.INVOICES,
    mockInvoices
  );
  const [payments, setPayments, removePayments] = useSessionStorage<Payment[]>(
    STORAGE_KEYS.PAYMENTS,
    mockPayments
  );
  const [deliveries, setDeliveries, removeDeliveries] = useSessionStorage<
    Delivery[]
  >(STORAGE_KEYS.DELIVERIES, mockDeliveries);
  const [returns, setReturns, removeReturns] = useSessionStorage<
    ReturnRequest[]
  >(STORAGE_KEYS.RETURNS, mockReturns);
  const [issues, setIssues, removeIssues] = useSessionStorage<Issue[]>(
    STORAGE_KEYS.ISSUES,
    mockIssues
  );
  const [feedback, setFeedback, removeFeedback] = useSessionStorage<Feedback[]>(
    STORAGE_KEYS.FEEDBACK,
    mockFeedback
  );
  const [products] = useSessionStorage<Product[]>(
    STORAGE_KEYS.PRODUCTS,
    mockProducts
  );

  const getOrderById = (id: number | string): Order | undefined => {
    const numId = Number(id);
    return orders.find(o => o.id === numId);
  };

  const createOrder = (orderInput: {
    customer_name: string;
    customer_sap_code: string;
    items: OrderItem[];
    notes?: string;
    delivery_date?: string;
    status?: OrderStatus;
  }): Order => {
    const maxNumFromOrderNumber = orders.reduce((max, o) => {
      const match = o.order_number?.match(/(\d+)$/);
      const parsedNum = match ? parseInt(match[1], 10) : 0;
      return Math.max(max, o.id, parsedNum);
    }, 0);
    const newId = maxNumFromOrderNumber + 1;
    const orderNumber = `B2B-2026-${String(newId).padStart(4, '0')}`;
    const totalAmount = orderInput.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    const nowIso = new Date().toISOString();
    const targetStatus: OrderStatus = orderInput.status || 'pending_approval';

    const newOrder: Order = {
      id: newId,
      order_number: orderNumber,
      customer_name: orderInput.customer_name,
      customer_sap_code: orderInput.customer_sap_code,
      status: targetStatus,
      items: orderInput.items,
      total_amount: totalAmount,
      created_at: nowIso,
      updated_at: nowIso,
      delivery_date:
        orderInput.delivery_date || dayjs().add(2, 'day').format('YYYY-MM-DD'),
      notes: orderInput.notes,
    };

    /** Prepend newly created order and deduplicate list */
    setOrders(prev => {
      const seen = new Set<string>();
      seen.add(orderNumber);
      const filtered = prev.filter(o => {
        if (!o || !o.order_number || seen.has(o.order_number)) return false;
        seen.add(o.order_number);
        return true;
      });
      return [newOrder, ...filtered];
    });

    /** Generate matching invoice for newly created order */
    const maxInvId = invoices.reduce((max, inv) => {
      const match = inv.invoice_number?.match(/(\d+)$/);
      const parsedNum = match ? parseInt(match[1], 10) : 0;
      return Math.max(max, inv.id, parsedNum);
    }, 0);
    const newInvId = maxInvId + 1;
    const newInvoice: Invoice = {
      id: newInvId,
      invoice_number: `INV-2026-${String(100 + newInvId).padStart(4, '0')}`,
      order_number: orderNumber,
      customer_name: orderInput.customer_name,
      issue_date: dayjs().format('YYYY-MM-DD'),
      due_date: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      total_amount: totalAmount,
      amount_paid: 0,
      balance_due: totalAmount,
      status: 'unpaid',
      sap_reference: `SAP-INV-${99250 + newInvId}`,
    };
    setInvoices(prev => {
      const seen = new Set<string>();
      seen.add(orderNumber);
      const filtered = prev.filter(inv => {
        if (!inv || !inv.order_number || seen.has(inv.order_number)) return false;
        seen.add(inv.order_number);
        return true;
      });
      return [newInvoice, ...filtered];
    });

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: number,
    status: OrderStatus,
    meta?: {
      approved_by?: string;
      rejection_reason?: string;
      delivery_date?: string;
      notes?: string;
    }
  ): Order | undefined => {
    let targetOrderNumber = '';
    let updatedOrder: Order | undefined;

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        targetOrderNumber = order.order_number;
        updatedOrder = {
          ...order,
          status,
          updated_at: new Date().toISOString(),
          ...(meta?.approved_by && {
            approved_by: meta.approved_by,
            approved_at: new Date().toISOString(),
          }),
          ...(meta?.rejection_reason && {
            rejection_reason: meta.rejection_reason,
            approved_at: new Date().toISOString(),
          }),
          ...(meta?.delivery_date && { delivery_date: meta.delivery_date }),
          ...(meta?.notes && { notes: meta.notes }),
        };
        return updatedOrder;
      })
    );

    /** Keep delivery status synchronized */
    if (targetOrderNumber) {
      setDeliveries(prev =>
        prev.map(del => {
          if (del.order_number !== targetOrderNumber) return del;
          if (status === 'delivered') {
            return {
              ...del,
              status: 'delivered',
              delivered_at: dayjs().format('YYYY-MM-DD HH:mm'),
            };
          }
          if (status === 'in_transit') {
            return { ...del, status: 'out_for_delivery' };
          }
          if (status === 'approved' && meta?.delivery_date) {
            return { ...del, scheduled_date: meta.delivery_date };
          }
          return del;
        })
      );
    }

    return updatedOrder;
  };

  const updateOrderItems = (
    orderId: number,
    items: OrderItem[]
  ): Order | undefined => {
    let updatedOrder: Order | undefined;
    const newTotal = items.reduce((sum, item) => sum + item.total_price, 0);

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        updatedOrder = {
          ...order,
          items,
          total_amount: newTotal,
          updated_at: new Date().toISOString(),
        };
        return updatedOrder;
      })
    );

    /** Keep related invoice total synced */
    if (updatedOrder) {
      const orderNum = (updatedOrder as Order).order_number;
      setInvoices(prev =>
        prev.map(inv => {
          if (inv.order_number !== orderNum) return inv;
          const newBalance = Math.max(0, newTotal - inv.amount_paid);
          return {
            ...inv,
            total_amount: newTotal,
            balance_due: newBalance,
            status:
              newBalance === 0
                ? 'paid'
                : inv.amount_paid > 0
                  ? 'partial'
                  : 'unpaid',
          };
        })
      );
    }

    return updatedOrder;
  };

  const deleteOrder = (orderId: number): void => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const approveOrder = (
    orderId: number,
    approverName = 'Grace Mwangi'
  ): Order | undefined => {
    const deliveryDate = dayjs().add(2, 'day').format('YYYY-MM-DD');

    return updateOrderStatus(orderId, 'approved', {
      approved_by: approverName,
      delivery_date: deliveryDate,
      notes: `Approved by ${approverName} on ${dayjs().format('DD MMM YYYY')}`,
    });
  };

  const rejectOrder = (orderId: number, reason: string): Order | undefined => {
    return updateOrderStatus(orderId, 'rejected', {
      rejection_reason: reason,
    });
  };

  const recordPayment = (
    invoiceNumber: string,
    amount: number,
    method: PaymentMethod,
    reference: string,
    confirmedBy = 'Grace Mwangi'
  ): Payment => {
    const maxPayId = payments.reduce((max, p) => Math.max(max, p.id), 0);
    const newPayId = maxPayId + 1;
    const newPayment: Payment = {
      id: newPayId,
      payment_number: `PAY-2026-${String(50 + newPayId).padStart(4, '0')}`,
      invoice_number: invoiceNumber,
      amount,
      method,
      reference,
      paid_at: new Date().toISOString(),
      confirmed_by: confirmedBy,
    };

    setPayments(prev => [newPayment, ...prev]);

    /** Update invoice balance and status */
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.invoice_number !== invoiceNumber) return inv;
        const newPaid = inv.amount_paid + amount;
        const newBalance = Math.max(0, inv.total_amount - newPaid);
        return {
          ...inv,
          amount_paid: newPaid,
          balance_due: newBalance,
          status:
            newBalance === 0 ? 'paid' : newPaid > 0 ? 'partial' : inv.status,
        };
      })
    );

    return newPayment;
  };

  const updateDelivery = (
    id: number,
    patch: Partial<Delivery>
  ): Delivery | undefined => {
    let updated: Delivery | undefined;
    setDeliveries(prev =>
      prev.map(del => {
        if (del.id !== id) return del;
        updated = { ...del, ...patch };
        return updated;
      })
    );
    return updated;
  };

  /**
   * Schedule or update delivery assignment for an approved order
   */
  const scheduleDelivery = (data: {
    orderNumber: string;
    scheduled_date: string;
    scheduled_time_slot?: string;
    driver_name: string;
    driver_phone: string;
    vehicle_plate: string;
    delivery_address?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
  }): Delivery | undefined => {
    const order = orders.find(o => o.order_number === data.orderNumber);
    let targetDelivery: Delivery | undefined;

    setDeliveries(prev => {
      const existingIndex = prev.findIndex(
        d => d.order_number === data.orderNumber
      );
      if (existingIndex !== -1) {
        targetDelivery = {
          ...prev[existingIndex],
          status: 'scheduled',
          scheduled_date: data.scheduled_date,
          scheduled_time_slot:
            data.scheduled_time_slot || '08:00 AM - 12:00 PM',
          driver_name: data.driver_name,
          driver_phone: data.driver_phone,
          vehicle_plate: data.vehicle_plate,
          delivery_address:
            data.delivery_address || prev[existingIndex].delivery_address,
          priority: data.priority || 'medium',
          notes: data.notes || prev[existingIndex].notes,
        };
        const updated = [...prev];
        updated[existingIndex] = targetDelivery;
        return updated;
      }

      const maxId = prev.reduce((m, d) => Math.max(m, d.id), 0);
      targetDelivery = {
        id: maxId + 1,
        order_number: data.orderNumber,
        customer_name: order?.customer_name,
        driver_name: data.driver_name,
        driver_phone: data.driver_phone,
        vehicle_plate: data.vehicle_plate,
        status: 'scheduled',
        scheduled_date: data.scheduled_date,
        scheduled_time_slot:
          data.scheduled_time_slot || '08:00 AM - 12:00 PM',
        delivery_address:
          data.delivery_address ||
          '45 Kariakoo Market Street, Dar es Salaam',
        priority: data.priority || 'medium',
        notes: data.notes,
        items_count: order
          ? order.items.reduce((s, i) => s + i.quantity, 0)
          : 0,
        total_amount: order ? order.total_amount : 0,
      };
      return [targetDelivery, ...prev];
    });

    /** Keep order delivery_date and status synced */
    if (order) {
      setOrders(prev =>
        prev.map(o => {
          if (o.order_number !== data.orderNumber) return o;
          return {
            ...o,
            delivery_date: data.scheduled_date,
            notes: data.notes || o.notes,
            updated_at: new Date().toISOString(),
          };
        })
      );
    }

    return targetDelivery;
  };

  const executeDelivery = (
    targetId: number,
    podData?: {
      pod_lat?: number;
      pod_lng?: number;
      notes?: string;
      pod_image?: string;
    }
  ): Delivery | undefined => {
    const delTarget = deliveries.find(
      d =>
        d.id === targetId ||
        orders.find(o => o.id === targetId)?.order_number === d.order_number
    );
    const orderTarget = orders.find(
      o => o.id === targetId || o.order_number === delTarget?.order_number
    );

    let updatedDel: Delivery | undefined;

    if (delTarget) {
      updatedDel = {
        ...delTarget,
        status: 'delivered',
        delivered_at: dayjs().format('YYYY-MM-DD HH:mm'),
        pod_lat: podData?.pod_lat ?? -6.8235,
        pod_lng: podData?.pod_lng ?? 39.2695,
        notes:
          podData?.notes ?? 'Delivered and verified by driver execution',
        pod_image: podData?.pod_image ?? 'pod_signature_mock.jpg',
      };

      setDeliveries(prev =>
        prev.map(d => (d.id === delTarget.id ? updatedDel! : d))
      );
    }

    if (orderTarget) {
      updateOrderStatus(orderTarget.id, 'delivered');
    }

    return updatedDel;
  };

  const createReturn = (
    returnData: Omit<ReturnRequest, 'id' | 'created_at'>
  ): ReturnRequest => {
    const maxRetId = returns.reduce((max, r) => Math.max(max, r.id), 0);
    const newId = maxRetId + 1;
    const newReturn: ReturnRequest = {
      ...returnData,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setReturns(prev => [newReturn, ...prev]);
    return newReturn;
  };

  const updateReturnStatus = (
    id: number,
    status: ReturnStatus,
    resolutionNotes?: string
  ): ReturnRequest | undefined => {
    let updated: ReturnRequest | undefined;
    setReturns(prev =>
      prev.map(ret => {
        if (ret.id !== id) return ret;
        updated = {
          ...ret,
          status,
          ...(resolutionNotes && { resolution_notes: resolutionNotes }),
          resolved_at: new Date().toISOString(),
        };
        return updated;
      })
    );
    return updated;
  };

  const createIssue = (data: {
    orderNumber: string;
    type: IssueType;
    priority?: IssuePriority;
    subject: string;
    description: string;
    assigned_to?: string;
  }): Issue => {
    const maxIssueId = issues.reduce((max, i) => Math.max(max, i.id), 0);
    const newId = maxIssueId + 1;
    const nowIso = new Date().toISOString();
    const newIssue: Issue = {
      id: newId,
      issue_number: `ISS-2026-${String(20 + newId).padStart(4, '0')}`,
      order_number: data.orderNumber,
      type: data.type,
      priority: data.priority || 'medium',
      subject: data.subject,
      description: data.description,
      status: 'open',
      created_at: nowIso,
      updated_at: nowIso,
      assigned_to: data.assigned_to || 'Grace Mwangi',
    };
    setIssues(prev => [newIssue, ...prev]);
    return newIssue;
  };

  const updateIssue = (
    id: number,
    patch: Partial<Issue>
  ): Issue | undefined => {
    let updated: Issue | undefined;
    setIssues(prev =>
      prev.map(iss => {
        if (iss.id !== id) return iss;
        updated = {
          ...iss,
          ...patch,
          updated_at: new Date().toISOString(),
        };
        return updated;
      })
    );
    return updated;
  };

  const createFeedback = (data: {
    rating: number;
    delivery_rating?: number;
    product_quality_rating?: number;
    comment: string;
    order_number?: string;
  }): Feedback => {
    const maxFId = feedback.reduce((max, f) => Math.max(max, f.id), 0);
    const newId = maxFId + 1;
    const newFeed: Feedback = {
      id: newId,
      order_number: data.order_number || 'General',
      rating: data.rating,
      delivery_rating: data.delivery_rating || data.rating,
      product_quality_rating: data.product_quality_rating || data.rating,
      comment: data.comment,
      submitted_at: new Date().toISOString(),
    };
    setFeedback(prev => [newFeed, ...prev]);
    return newFeed;
  };

  const resetDatabase = (): void => {
    removeOrders();
    removeInvoices();
    removePayments();
    removeDeliveries();
    removeReturns();
    removeIssues();
    removeFeedback();
  };

  const sortedOrders = React.useMemo(() => {
    const seen = new Set<string>();
    const uniqueList: Order[] = [];
    for (const o of orders) {
      if (!o || !o.order_number) continue;
      if (seen.has(o.order_number)) continue;
      seen.add(o.order_number);
      uniqueList.push(o);
    }
    return uniqueList.sort((a, b) => {
      const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
      const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [orders]);

  const sortedInvoices = React.useMemo(() => {
    const seen = new Set<string>();
    const uniqueList: Invoice[] = [];
    for (const inv of invoices) {
      if (!inv || !inv.order_number) continue;
      if (seen.has(inv.order_number)) continue;
      seen.add(inv.order_number);
      uniqueList.push(inv);
    }
    return uniqueList.sort((a, b) => {
      const timeB = new Date(b.issue_date || 0).getTime();
      const timeA = new Date(a.issue_date || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [invoices]);

  const sortedPayments = React.useMemo(() => {
    return [...payments].sort((a, b) => {
      const timeB = new Date(b.paid_at || 0).getTime();
      const timeA = new Date(a.paid_at || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [payments]);

  const sortedDeliveries = React.useMemo(() => {
    const seen = new Set<string>();
    const uniqueList: Delivery[] = [];
    for (const d of deliveries) {
      if (!d || !d.order_number) continue;
      if (seen.has(d.order_number)) continue;
      seen.add(d.order_number);
      uniqueList.push(d);
    }
    return uniqueList.sort((a, b) => {
      const timeB = new Date(b.scheduled_date || b.delivered_at || 0).getTime();
      const timeA = new Date(a.scheduled_date || a.delivered_at || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [deliveries]);

  const sortedReturns = React.useMemo(() => {
    return [...returns].sort((a, b) => {
      const timeB = new Date(b.created_at || 0).getTime();
      const timeA = new Date(a.created_at || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [returns]);

  const sortedIssues = React.useMemo(() => {
    return [...issues].sort((a, b) => {
      const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
      const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [issues]);

  const sortedFeedback = React.useMemo(() => {
    return [...feedback].sort((a, b) => {
      const timeB = new Date(b.submitted_at || 0).getTime();
      const timeA = new Date(a.submitted_at || 0).getTime();
      return timeB - timeA || b.id - a.id;
    });
  }, [feedback]);

  const value: MockDataContextType = {
    orders: sortedOrders,
    invoices: sortedInvoices,
    payments: sortedPayments,
    deliveries: sortedDeliveries,
    returns: sortedReturns,
    issues: sortedIssues,
    feedback: sortedFeedback,
    products,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderItems,
    deleteOrder,
    approveOrder,
    rejectOrder,
    recordPayment,
    updateDelivery,
    scheduleDelivery,
    executeDelivery,
    createReturn,
    updateReturnStatus,
    createIssue,
    updateIssue,
    createFeedback,
    resetDatabase,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

/**
 * Hook to access the persistent B2B Mock Database
 *
 * @returns The MockDataContextType store
 */
export const useMockDb = (): MockDataContextType => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockDb must be used within a MockDataProvider');
  }
  return context;
};

export default MockDataContext;
