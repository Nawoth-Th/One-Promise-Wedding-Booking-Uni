import { api } from "@/lib/api"
import type { Order, TeamMember, PricingItem } from "@/lib/types"

// --- Order Actions ---
export async function createOrder(data: Order) {
  try {
    const res: any = await api.createOrder(data);
    return { success: true, orderId: res._id, orderNumber: res.orderNumber }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

export async function updateOrder(id: string, data: Partial<Order>) {
  try {
    await api.updateOrder(id, data);
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

export async function deleteOrder(id: string) {
  try {
    await api.deleteOrder(id);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function updateOrderAgreement(id: string, agreementData: any) {
  try {
    await api.updateOrder(id, { agreementDetails: agreementData, agreementStatus: 'Signed' });
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
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

// --- Payment Actions ---
export async function uploadPaymentProof(formData: FormData, orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real app, you'd upload the file first then get the URL
    // Here we'll simulate by updating the order with a mock URL and Pending status
    const financials = {
      paymentProof: {
        url: "https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400", // Sample receipt image
        status: "Pending",
        uploadedAt: new Date()
      }
    };
    await api.updateOrder(orderId, { financials } as any);
    return { success: true }
  } catch (e) {
    console.error(e);
    return { success: false, error: (e as any).message || "Failed to update payment status" }
  }
}

export async function verifyPayment(orderId: string, status: "Verified" | "Rejected") {
  try {
    const order = await api.getOrderById(orderId);
    const financials = {
      ...order.financials,
      paymentProof: {
        ...(order.financials.paymentProof || { url: "", uploadedAt: new Date() }),
        status: status as "Verified" | "Rejected"
      }
    };
    await api.updateOrder(orderId, { financials } as any);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
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
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function updatePricingItem(id: string, data: Partial<PricingItem>) {
  try {
    await api.updatePricingItem(id, data);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function deletePricingItem(id: string) {
  try {
    await api.deletePricingItem(id);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
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
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  try {
    await api.updateTeamMember(id, data);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await api.deleteTeamMember(id);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

// --- Progress Actions ---
export async function updateOrderProgress(orderId: string, stepId: number) {
  try {
    const order = await api.getOrderById(orderId);
    let newProgress: any[] = [...(order.progress?.history || [])];
    
    // If progress is empty, init it
    if (newProgress.length === 0) {
      newProgress = [
        { id: 1, title: 'Contract Signed', description: 'Client has signed the agreement', completed: false, date: null },
        { id: 2, title: 'Advance Payment', description: 'Received 25,000 LKR advance', completed: false, date: null },
        { id: 3, title: 'Pre-Shoot Completed', description: 'All pre-wedding shoots done', completed: false, date: null },
        { id: 4, title: 'Event Date 1', description: 'Primary event videography', completed: false, date: null },
        { id: 5, title: 'Event Date 2', description: 'Secondary event videography', completed: false, date: null },
        { id: 6, title: 'Full Payment', description: 'Received final balance', completed: false, date: null },
        { id: 7, title: 'Editing Started', description: 'Post-production phase', completed: false, date: null },
        { id: 8, title: 'First Draft Sent', description: 'Sent for client review', completed: false, date: null },
        { id: 9, title: 'Final Delivery', description: 'All products delivered', completed: false, date: null }
      ];
    }
    
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
  } catch(e) {
    console.error(e)
    return { success: false }
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
    await api.updateOrder(orderId, { assignments: newAssignments } as any);
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}
