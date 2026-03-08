import React, { createContext, useContext, useReducer, useEffect } from 'react';

const StoreContext = createContext();

const initialState = {
    cart: {
        cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
        shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
        paymentMethod: localStorage.getItem('paymentMethod') ? JSON.parse(localStorage.getItem('paymentMethod')) : 'Razorpay',
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
        case 'USER_LOGIN':
            return { ...state, userLogin: { userInfo: action.payload } };
        case 'USER_LOGOUT':
            return { ...state, userLogin: { userInfo: null }, cart: { cartItems: [], shippingAddress: {}, paymentMethod: 'Razorpay' } };
        default:
            return state;
    }
}

export const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(storeReducer, initialState);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(state.cart.cartItems));
    }, [state.cart.cartItems]);

    useEffect(() => {
        if (state.userLogin.userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(state.userLogin.userInfo));
        } else {
            localStorage.removeItem('userInfo');
        }
    }, [state.userLogin.userInfo]);

    const value = { state, dispatch };
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
