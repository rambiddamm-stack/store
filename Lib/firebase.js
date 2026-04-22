import { initializeApp, getApps } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, set, get, push, query, orderByChild } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getDatabase(app)

// AUTH
export const signUp = async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await set(ref(db, 'profiles/' + result.user.uid), {
      name, email, is_admin: false, created_at: Date.now()
    })
    return { data: result.user, error: null }
  } catch (e) { return { data: null, error: e } }
}

export const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { data: result.user, error: null }
  } catch (e) { return { data: null, error: e } }
}

export const logOut = async () => {
  try { await signOut(auth); return { error: null } }
  catch (e) { return { error: e } }
}

export const getProfile = async (uid) => {
  try {
    const snap = await get(ref(db, 'profiles/' + uid))
    return { data: snap.val(), error: null }
  } catch (e) { return { data: null, error: e } }
}

// PRODUCTS
export const getProducts = async () => {
  try {
    const snap = await get(ref(db, 'products'))
    if (!snap.exists()) return { data: [], error: null }
    const data = Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }))
    return { data, error: null }
  } catch (e) { return { data: [], error: e } }
}

export const getProduct = async (slug) => {
  try {
    const snap = await get(ref(db, 'products'))
    if (!snap.exists()) return { data: null, error: null }
    const found = Object.entries(snap.val()).find(([, v]) => v.slug === slug)
    if (!found) return { data: null, error: null }
    return { data: { id: found[0], ...found[1] }, error: null }
  } catch (e) { return { data: null, error: e } }
}

export const checkPurchased = async (uid, productId) => {
  try {
    const snap = await get(ref(db, 'purchases/' + uid + '/' + productId))
    return snap.exists()
  } catch (e) { return false }
}

// ORDERS
export const createOrder = async (uid, items, total) => {
  try {
    const orderId = push(ref(db, 'orders')).key
    const order = { id: orderId, user_id: uid, total, status: 'paid', created_at: Date.now(), items }
    await set(ref(db, 'orders/' + orderId), order)
    for (const item of items) {
      await set(ref(db, 'purchases/' + uid + '/' + item.id), { purchased_at: Date.now(), order_id: orderId })
    }
    return { data: order, error: null }
  } catch (e) { return { data: null, error: e } }
}

export const getUserOrders = async (uid) => {
  try {
    const snap = await get(ref(db, 'orders'))
    if (!snap.exists()) return { data: [], error: null }
    const data = Object.values(snap.val()).filter(o => o.user_id === uid)
    return { data, error: null }
  } catch (e) { return { data: [], error: e } }
}

export const getAllOrders = async () => {
  try {
    const snap = await get(ref(db, 'orders'))
    if (!snap.exists()) return { data: [], error: null }
    return { data: Object.values(snap.val()), error: null }
  } catch (e) { return { data: [], error: e } }
}

export const getExpenses = async () => {
  try {
    const snap = await get(ref(db, 'expenses'))
    if (!snap.exists()) return { data: [], error: null }
    return { data: Object.values(snap.val()), error: null }
  } catch (e) { return { data: [], error: e } }
}

export const addExpense = async (expense) => {
  try {
    const id = push(ref(db, 'expenses')).key
    await set(ref(db, 'expenses/' + id), { ...expense, id, created_at: Date.now() })
    return { data: expense, error: null }
  } catch (e) { return { data: null, error: e } }
}
