import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  Firestore
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { Order } from '../types';

let firestoreInstance: Firestore | null = null;

export function getServerFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(raw);
      const app = getApps().length === 0
        ? initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
            appId: config.appId
          }, 'bazli-server-app')
        : getApps()[0];

      firestoreInstance = config.firestoreDatabaseId
        ? getFirestore(app, config.firestoreDatabaseId)
        : getFirestore(app);

      return firestoreInstance;
    }
  } catch (err) {
    console.warn('Server Firestore init note:', err);
  }
  return null;
}

/**
 * Creates or overwrites a pending Bazli order document in Firestore
 */
export async function createPendingOrderInFirestore(order: Order): Promise<boolean> {
  const db = getServerFirestore();
  if (!db) return false;

  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      orderId: order.id,
      userId: order.customerId,
      syncedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Record initial status history
    try {
      const historyRef = doc(collection(db, 'orders', order.id, 'status_history'));
      await setDoc(historyRef, {
        orderId: order.id,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        timestamp: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });
    } catch (histErr) {
      console.warn('Status history write note:', histErr);
    }

    return true;
  } catch (err) {
    console.error('Failed to create pending order in Firestore:', err);
    return false;
  }
}

/**
 * Updates payment status and verification timestamp on an order in Firestore
 */
export async function updateOrderPaymentInFirestore(
  orderId: string,
  updates: {
    paymentStatus: Order['paymentStatus'];
    orderStatus?: Order['orderStatus'];
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentVerifiedAt?: string;
    razorpayWebhookEventId?: string;
  }
): Promise<boolean> {
  const db = getServerFirestore();
  if (!db) return false;

  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    // Record audit event in status history
    try {
      const historyRef = doc(collection(db, 'orders', orderId, 'status_history'));
      await setDoc(historyRef, {
        orderId,
        status: updates.orderStatus || 'Confirmed',
        paymentStatus: updates.paymentStatus,
        razorpayPaymentId: updates.razorpayPaymentId || null,
        timestamp: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });
    } catch (histErr) {
      console.warn('Payment update history write note:', histErr);
    }

    return true;
  } catch (err) {
    console.error(`Failed to update order #${orderId} in Firestore:`, err);
    return false;
  }
}

/**
 * Fetches order from Firestore by ID
 */
export async function getOrderFromFirestore(orderId: string): Promise<Order | null> {
  const db = getServerFirestore();
  if (!db) return null;

  try {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Order;
  } catch (err) {
    console.error(`Failed to fetch order #${orderId} from Firestore:`, err);
    return null;
  }
}
