import { createContext } from "react";

/**
 * App-wide context (moved out of App.jsx so that file only exports a
 * component, keeping React Fast Refresh happy).
 * Shape is identical to the original:
 *   users, setUsers, user, setUser, products, productsLoading,
 *   refetchProducts, cart, setCart, orders, setOrders
 */
export const appContext = createContext();
