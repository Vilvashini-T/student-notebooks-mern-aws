import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import API from './api';

const StoreContext = createContext();

const initialState = {
    cart: {
        cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
        shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
        paymentMethod: localStorage.getItem('paymentMethod') ? JSON.parse(localStorage.getItem('paymentMethod')) : 'Razorpay',
        appliedCoupon: localStorage.getItem('appliedCoupon') ? JSON.parse(localStorage.getItem('appliedCoupon')) : null,
    },
    userLogin: {
        userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    }
};

function storeReducer(state, action) {
    switch (action.type) {
        case 'CART_ADD_ITEM': {
            const item = action.payload;
            const existItem = state.cart.cartItems.find(x => x.variation === item.variation);
            if (existItem) {
                return {
                    ...state,
                    cart: {
                        ...state.cart,
                        cartItems: state.cart.cartItems.map(x => x.variation === existItem.variation ? item : x)
                    }
                };
            } else {
                return { ...state, cart: { ...state.cart, cartItems: [...state.cart.cartItems, item] } };
            }
        }
        case 'CART_REMOVE_ITEM': {
            return {
                ...state,
                cart: {
                    ...state.cart,
                    cartItems: state.cart.cartItems.filter(x => x.variation !== action.payload)
                }
            }
        }
        case 'CART_SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    shippingAddress: action.payload,
                },
            };
        case 'CART_SAVE_PAYMENT_METHOD':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    paymentMethod: action.payload,
                },
            };
        case 'CART_CLEAR_ITEMS':
            return {
                ...state,
                cart: { ...state.cart, cartItems: [] }
            };
        case 'CART_SET_ITEMS':
            return {
                ...state,
                cart: { ...state.cart, cartItems: action.payload }
            };
        case 'CART_APPLY_COUPON':
            return {
                ...state,
                cart: { ...state.cart, appliedCoupon: action.payload }
            };
        case 'CART_REMOVE_COUPON':
            return {
                ...state,
                cart: { ...state.cart, appliedCoupon: null }
            };
        case 'USER_UPDATE_WISHLIST':
            if (state.userLogin.userInfo) {
                return {
                    ...state,
                    userLogin: {
                        ...state.userLogin,
                        userInfo: { ...state.userLogin.userInfo, wishlist: action.payload }
                    }
                };
            }
            return state;
        case 'USER_LOGIN':
            return { ...state, userLogin: { userInfo: action.payload } };
        case 'USER_LOGOUT':
            return { ...state, userLogin: { userInfo: null }, cart: { cartItems: [], shippingAddress: {}, paymentMethod: 'Razorpay', appliedCoupon: null } };
        default:
            return state;
    }
}

export const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(storeReducer, initialState);

    const firstRender = useRef(true);

    // Sync to localstorage and to backend (if logged in) whenever cart changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(state.cart.cartItems));
        localStorage.setItem('appliedCoupon', JSON.stringify(state.cart.appliedCoupon));

        const syncWithServer = async () => {
            if (state.userLogin.userInfo && !firstRender.current) {
                try {
                    await API.post('/api/cart/sync', { cartItems: state.cart.cartItems });
                } catch (error) {
                    console.error('Failed to sync cart with server', error);
                }
            }
        };
        syncWithServer();
    }, [state.cart.cartItems, state.userLogin.userInfo]);

    // Handle Login/Logout sync dynamics
    useEffect(() => {
        const handleLoginSync = async () => {
            if (state.userLogin.userInfo) {
                localStorage.setItem('userInfo', JSON.stringify(state.userLogin.userInfo));

                // Fetch server cart
                try {
                    const { data } = await API.get('/api/cart');

                    const localCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                    const serverCartItems = data?.cartItems || [];

                    if (localCartItems.length === 0 && serverCartItems.length > 0) {
                        // User logged in on a blank browser, pull from server
                        dispatch({ type: 'CART_SET_ITEMS', payload: serverCartItems });
                    } else if (localCartItems.length > 0 && serverCartItems.length === 0) {
                        // User built a cart while logged out, push to blank server
                        await API.post('/api/cart/sync', { cartItems: localCartItems });
                    } else if (localCartItems.length > 0 && serverCartItems.length > 0) {
                        // Intelligent Merge: Trigger the backend to merge local with server
                        const { data: mergedCart } = await API.post('/api/cart/sync', { cartItems: localCartItems });
                        dispatch({ type: 'CART_SET_ITEMS', payload: mergedCart.cartItems });
                    }

                } catch (error) {
                    console.error('Error fetching server cart', error);
                }

                firstRender.current = false;
            } else {
                localStorage.removeItem('userInfo');
                firstRender.current = false;
            }
        };

        handleLoginSync();
    }, [state.userLogin.userInfo]);

    const value = { state, dispatch };
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
