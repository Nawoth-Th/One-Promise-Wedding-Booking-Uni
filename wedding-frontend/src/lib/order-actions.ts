/**
 * @file order-actions.ts
 * @description Frontend Service Layer / Action Aggregator.
 * This file serves as the abstraction layer between the React UI components 
 * and the low-level API client. It handles data transformation, error logging,
 * and result formatting for the frontend.
 * 
 * Featured Categories:
 * - Order CRUD operations.
 * - Payment and Financial Lifecycle.
 * - Team & Assignment Management.
 * - Workflow Tracking (Progress Steps).
 */

import { api } from "@/lib/api"
import type { Order, TeamMember, PricingItem } from "@/lib/types"

/**
 * Action: Create Order
 * Communicates with the backend to initialize a new booking.
 * @param data - The validated order object from the form.
 */
export async function createOrder(data: Order) {
  try {
    const res: any = await api.createOrder(data);
    return { success: true, orderId: res._id, orderNumber: res.orderNumber }
  } catch (e: any) {
    console.error("Order creation failed:", e)
    return { success: false, error: e.message }
  }
}

export async function updateOrder(id: string, data: Partial<Order>) {
  try {
    const res = await api.updateOrder(id, data);
    return { success: true, order: res }
  } catch (e: any) {
    console.error("Order update failed:", e)
    return { success: false, error: e.message }
  }
}

export async function deleteOrder(id: string) {
  try {
    await api.deleteOrder(id);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

export async function updateOrderAgreement(id: string, agreementData: any) {
  try {
    await api.updateOrder(id, { agreementDetails: agreementData, agreementStatus: 'Signed' });
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

export async function ensurePortalToken(id: string) {
  try {
    const order = await api.getOrderById(id);
    return order.portalToken;
  } catch(e) {
    return "mock-portal-token";
  }
}

export async function ensureAgreementToken(id: string) {
  try {
    const order = await api.getOrderById(id);
    return order.agreementToken;
  } catch(e) {
    return "mock-agreement-token";
  }
}

export async function uploadPaymentProof(formData: FormData, orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Strategy: Real File Upload via FormData
    console.log('--- Frontend Upload Start ---');
    console.log('OrderId:', orderId);
    console.log('Has File:', formData.get('file') instanceof File);

    const res = await fetch(`/api/agreement/upload-proof/${orderId}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
    }

    return { success: true }
  } catch (e: any) {
    console.error("Payment proof upload failed:", e);
    return { success: false, error: e.message || "Failed to upload payment proof" }
  }
}

export async function verifyPayment(orderId: string, status: "Verified" | "Rejected", amount: number = 0): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const order = await api.getOrderById(orderId);
    
    // Logic: Update Balance on Verification
    // Feature: Automatically debit the entered amount from the outstanding balance.
    let newBalance = order.financials.balance;
    if (status === 'Verified') {
        newBalance = Math.max(0, order.financials.balance - amount);
    }

    const financials = {
      ...order.financials,
      balance: newBalance,
      paymentProof: {
        ...(order.financials.paymentProof || { url: "", uploadedAt: new Date() }),
        status: status as "Verified" | "Rejected"
      }
    };
    const updatedOrder = await api.updateOrder(orderId, { financials } as any);
    return { success: true, order: updatedOrder }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

// --- Pricing Actions ---

export async function getPricingItems(): Promise<PricingItem[]> {
  try {
    return await api.getPricingItems() as unknown as PricingItem[];
  } catch(e) {
    console.error(e)
    return []
  }
}

export async function createPricingItem(data: Omit<PricingItem, "_id" | "updatedAt">) {
  try {
    await api.createPricingItem(data);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

export async function updatePricingItem(id: string, data: Partial<PricingItem>) {
  try {
    await api.updatePricingItem(id, data);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

export async function deletePricingItem(id: string) {
  try {
    await api.deletePricingItem(id);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

// --- Team Actions ---
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    return await api.getTeamMembers();
  } catch(e) {
    console.error(e)
    return []
  }
}

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    const members: TeamMember[] = await api.getTeamMembers();
    return members.filter((m: TeamMember) => m.active);
  } catch(e) {
    console.error(e)
    return []
  }
}

export async function createTeamMember(data: TeamMember) {
  try {
    await api.createTeamMember(data);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  try {
    await api.updateTeamMember(id, data);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await api.deleteTeamMember(id);
    return { success: true }
  } catch(e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}

/**
 * Action: Milestone Management
 * Logic: Toggles the completion status of a specific workflow step.
 * Demonstrates state manipulation on complex nested arrays.
 */
export async function updateOrderProgress(orderId: string, stepId: number) {
  try {
    const order = await api.getOrderById(orderId);
    let newProgress: any[] = [...(order.progress?.history || [])];
    
    // Feature: Auto-Initialization
    // If an order lacks a progress history, provide a default template.
    if (newProgress.length === 0) {
      newProgress = [
        { id: 1, title: 'Contract Signed', description: 'Client has signed the agreement', completed: false, date: null },
        { id: 2, title: 'Advance Payment', description: 'Received 25,000 LKR advance', completed: false, date: null },
        { id: 6, title: 'Full Payment', description: 'Received final balance', completed: false, date: null },
        { id: 9, title: 'Final Delivery', description: 'All products delivered', completed: false, date: null }
      ];
    }
    
    // Strategy: Mutable modification on cloned array
    const index = newProgress.findIndex((p: any) => p.id === stepId);
    if (index >= 0) {
      newProgress[index].completed = !newProgress[index].completed;
      newProgress[index].date = newProgress[index].completed ? new Date().toISOString() : null;
    }
    await api.updateOrder(orderId, { 
      progress: { 
        ...order.progress, 
        history: newProgress, 
        currentStep: stepId, 
        lastUpdated: new Date() 
      } 
    } as any);
    return { success: true }
  } catch(e: any) {
    console.error("Progress update failed:", e)
    return { success: false, error: e.message }
  }
}

export async function ensureTrackingToken(orderId: string) {
  try {
    const order = await api.getOrderById(orderId);
    return { success: true, token: order.trackingToken };
  } catch(e) {
    return { success: false, token: "" }
  }
}

// --- Assignment Actions ---
export async function assignTeamMembers(orderId: string, eventType: string, memberIds: string[]) {
  try {
    const order = await api.getOrderById(orderId);
    let newAssignments: any = { ...(order.assignments || {}) };
    newAssignments[eventType] = memberIds;
    const res = await api.updateOrder(orderId, { assignments: newAssignments } as any);
    return { success: true, order: res }
  } catch(e: any) {
    console.error("Team assignment failed:", e)
    return { success: false, error: e.message }
  }
}
