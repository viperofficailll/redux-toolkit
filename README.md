

> A comprehensive guide for building scalable, maintainable Redux applications in production environments.

[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.0+-764ABC?style=flat&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)


## 📦 Installation

```bash
# Install Redux Toolkit and React-Redux
npm install @reduxjs/toolkit react-redux

# Install Axios
npm install axios

# Install TypeScript types (if using TypeScript)
npm install -D @types/react-redux
```

---

## 📋 Table of Contents

- [Advanced Architecture Patterns](#-advanced-architecture-patterns)
- [TypeScript Integration](#-typescript-integration)
- [RTK Query – Advanced API Management](#-rtk-query--advanced-api-management)
- [Performance Optimization](#-performance-optimization)
- [Async Logic & Thunks](#-async-logic--thunks)
- [Middleware & Side Effects](#-middleware--side-effects)
- [Testing Redux](#-testing-redux)
- [Real-World Patterns](#-real-world-patterns)
- [Debugging Tools](#-debugging-tools)
- [Production Checklist](#-production-checklist)
- [Best Practices Summary](#-best-practices-summary)

---

## 🏗️ Advanced Architecture Patterns

### Feature-Based Structure (Recommended for Large Apps)

```
src/
├── app/
│   ├── store.ts
│   ├── rootReducer.ts
│   └── hooks.ts
├── features/
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authAPI.ts
│   │   ├── authSelectors.ts
│   │   ├── authThunks.ts
│   │   └── types.ts
│   ├── products/
│   │   ├── productsSlice.ts
│   │   ├── productsAPI.ts
│   │   └── components/
│   └── cart/
├── shared/
│   ├── utils/
│   ├── constants/
│   └── types/
└── middleware/
    ├── errorMiddleware.ts
    └── loggerMiddleware.ts
```

### Domain-Driven Design with Redux

```typescript
// features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, AuthState } from './types'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.permissions = []
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer
```

---

## 🔷 TypeScript Integration

### Type-Safe Store Configuration

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '@/features/auth/authSlice'
import productsReducer from '@/features/products/productsSlice'
import { apiSlice } from '@/features/api/apiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setToken'],
        ignoredPaths: ['auth.lastActivity'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Custom Typed Hooks

```typescript
// app/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### Advanced Selector Patterns with Reselect

```typescript
// features/products/productsSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'

// Basic selectors
export const selectAllProducts = (state: RootState) => state.products.items
export const selectProductsLoading = (state: RootState) => state.products.loading
export const selectFilters = (state: RootState) => state.products.filters

// Memoized selectors (only recompute when dependencies change)
export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectFilters],
  (products, filters) => {
    let filtered = products

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        p => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }
)

// Parametric selectors
export const selectProductById = createSelector(
  [selectAllProducts, (_state: RootState, productId: string) => productId],
  (products, productId) => products.find(p => p.id === productId)
)

// Complex derived data
export const selectProductStats = createSelector(
  [selectAllProducts],
  (products) => ({
    total: products.length,
    averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
    categories: [...new Set(products.map(p => p.category))],
    inStock: products.filter(p => p.stock > 0).length,
  })
)
```

---

## 🌐 RTK Query – Advanced API Management

### Axios Configuration Setup

```typescript
// api/axiosConfig.ts
import axios from 'axios'
import { store } from '@/app/store'
import { logout, setCredentials } from '@/features/auth/authSlice'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        store.dispatch(setCredentials(data))
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        store.dispatch(logout())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

// Optional: Create typed axios instance
export const api = {
  get: <T>(url: string, config?: any) => 
    axiosInstance.get<T>(url, config).then(res => res.data),
  post: <T>(url: string, data?: any, config?: any) => 
    axiosInstance.post<T>(url, data, config).then(res => res.data),
  put: <T>(url: string, data?: any, config?: any) => 
    axiosInstance.put<T>(url, data, config).then(res => res.data),
  patch: <T>(url: string, data?: any, config?: any) => 
    axiosInstance.patch<T>(url, data, config).then(res => res.data),
  delete: <T>(url: string, config?: any) => 
    axiosInstance.delete<T>(url, config).then(res => res.data),
}
```

### Complete API Slice Setup with Axios

```typescript
// features/api/apiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import axiosInstance from '@/api/axiosConfig'

// Create custom base query using axios
const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
      headers?: AxiosRequestConfig['headers']
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
      })
      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'User', 'Order', 'Cart'],
  endpoints: () => ({}),
})
```

### Feature-Specific API Endpoints with Axios

```typescript
// features/products/productsAPI.ts
import { apiSlice } from '@/features/api/apiSlice'
import { Product, ProductsResponse, CreateProductDTO } from './types'

export const productsAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query endpoints
    getProducts: builder.query<ProductsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/products',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    // Mutation endpoints
    createProduct: builder.mutation<Product, CreateProductDTO>({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        data: product,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
      // Optimistic update
      async onQueryStarted(newProduct, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsAPI.util.updateQueryData('getProducts', {}, (draft) => {
            draft.products.unshift({ ...newProduct, id: 'temp-id' })
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    // Infinite scroll / pagination
    getProductsInfinite: builder.query<ProductsResponse, number>({
      query: (page) => ({
        url: '/products',
        method: 'GET',
        params: { page, limit: 20 },
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        currentCache.products.push(...newItems.products)
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg
      },
    }),

    // Upload product with image (FormData)
    uploadProductWithImage: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: '/products/upload',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazyGetProductsQuery,
  useUploadProductWithImageMutation,
  usePrefetch,
} = productsAPI
```

### Alternative: Using Axios with createAsyncThunk

```typescript
// features/products/productsThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/api/axiosConfig'
import { Product, CreateProductDTO } from './types'

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const data = await api.get<{ products: Product[]; total: number }>(
        `/products?page=${page}&limit=${limit}`
      )
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

// Fetch single product
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await api.get<Product>(`/products/${id}`)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Product not found')
    }
  }
)

// Create product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: CreateProductDTO, { rejectWithValue }) => {
    try {
      const data = await api.post<Product>('/products', productData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product')
    }
  }
)

// Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const result = await api.patch<Product>(`/products/${id}`, data)
      return result
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product')
    }
  }
)

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product')
    }
  }
)

// Upload with FormData
export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const data = await api.post<{ imageUrl: string }>(
        `/products/${id}/image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      return { id, imageUrl: data.imageUrl }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed')
    }
  }
)
```

### Using RTK Query in Components

```typescript
// components/ProductList.tsx
import { useGetProductsQuery } from '@/features/products/productsAPI'

function ProductList() {
  const { data, error, isLoading, isFetching, refetch } = useGetProductsQuery({
    page: 1,
    limit: 20,
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorAlert error={error} onRetry={refetch} />

  return (
    <div>
      {isFetching && <LoadingSpinner />}
      {data?.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// components/ProductForm.tsx
import { useCreateProductMutation } from '@/features/products/productsAPI'

function ProductForm() {
  const [createProduct, { isLoading, error }] = useCreateProductMutation()

  const handleSubmit = async (formData) => {
    try {
      await createProduct(formData).unwrap()
      toast.success('Product created!')
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create product')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## ⚡ Performance Optimization

### Normalized State with `createEntityAdapter`

```typescript
// features/products/productsSlice.ts
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
import { Product } from './types'

const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt,
})

const productsSlice = createSlice({
  name: 'products',
  initialState: productsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {},
  }),
  reducers: {
    productAdded: productsAdapter.addOne,
    productsReceived: productsAdapter.setAll,
    productUpdated: productsAdapter.updateOne,
    productRemoved: productsAdapter.removeOne,
    productsUpserted: productsAdapter.upsertMany,
  },
})

// Generated selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectEntities: selectProductEntities,
  selectTotal: selectTotalProducts,
} = productsAdapter.getSelectors((state: RootState) => state.products)

export default productsSlice.reducer
```

### Batching Updates

```typescript
import { batch } from 'react-redux'

function updateMultipleStates() {
  batch(() => {
    dispatch(action1())
    dispatch(action2())
    dispatch(action3())
  })
  // Only one re-render
}
```

### Lazy Loading Slices

```typescript
// Dynamic reducer injection
import { injectReducer } from '@/app/store'

const DynamicFeature = lazy(() =>
  import('./features/analytics').then((module) => {
    injectReducer('analytics', module.analyticsReducer)
    return { default: module.AnalyticsPage }
  })
)
```

---

## 🔄 Async Logic & Thunks

### Complex Async Thunks with Axios

```typescript
// features/orders/orderThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'
import axiosInstance from '@/api/axiosConfig'
import { clearCart } from '../cart/cartSlice'
import { showNotification } from '../notifications/notificationsSlice'

export const createOrder = createAsyncThunk<
  Order,
  CreateOrderDTO,
  { state: RootState; rejectValue: string }
>(
  'orders/createOrder',
  async (orderData, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState()
      
      if (!auth.isAuthenticated) {
        return rejectWithValue('Please login first')
      }

      const { data } = await axiosInstance.post<Order>('/orders', orderData)
      
      // Dispatch additional actions
      dispatch(clearCart())
      dispatch(showNotification({ message: 'Order placed successfully!', type: 'success' }))

      return data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create order'
      return rejectWithValue(message)
    }
  }
)

// Parallel requests
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [orders, products, analytics] = await Promise.all([
        axiosInstance.get('/orders'),
        axiosInstance.get('/products'),
        axiosInstance.get('/analytics'),
      ])

      return {
        orders: orders.data,
        products: products.data,
        analytics: analytics.data,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  }
)

// Sequential requests with dependency
export const processCheckout = createAsyncThunk(
  'checkout/process',
  async (checkoutData: CheckoutDTO, { rejectWithValue }) => {
    try {
      // Step 1: Validate cart
      const { data: validationResult } = await axiosInstance.post('/cart/validate', {
        items: checkoutData.items,
      })

      if (!validationResult.valid) {
        return rejectWithValue('Some items are out of stock')
      }

      // Step 2: Process payment
      const { data: paymentResult } = await axiosInstance.post('/payment/process', {
        amount: checkoutData.total,
        method: checkoutData.paymentMethod,
      })

      // Step 3: Create order
      const { data: order } = await axiosInstance.post('/orders', {
        ...checkoutData,
        paymentId: paymentResult.id,
      })

      return order
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Checkout failed')
    }
  }
)

// Handle in slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.orders.push(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to create order'
      })
  },
})
```

### Cancellable Thunks with Axios

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const fetchData = createAsyncThunk(
  'data/fetch',
  async (params: any, { signal }) => {
    // Create cancel token from abort signal
    const source = axios.CancelToken.source()
    
    signal.addEventListener('abort', () => {
      source.cancel()
    })

    const { data } = await axiosInstance.get('/data', {
      params,
      cancelToken: source.token,
    })
    
    return data
  }
)

// In component
const promise = dispatch(fetchData(params))

// Cancel if component unmounts
useEffect(() => {
  return () => promise.abort()
}, [])
```

### Error Handling with Axios

```typescript
// features/products/productsSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { fetchProducts, createProduct } from './productsThunks'

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    validationErrors: {},
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null
      state.validationErrors = {}
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.products
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    
    // Create product with validation errors
    builder.addCase(createProduct.rejected, (state, action: any) => {
      state.loading = false
      
      // Handle validation errors (422)
      if (action.payload?.errors) {
        state.validationErrors = action.payload.errors
      } else {
        state.error = action.payload as string
      }
    })
  },
})

export const { clearErrors } = productsSlice.actions
export default productsSlice.reducer
```

---

## 🔌 Middleware & Side Effects

### Custom Middleware

```typescript
// middleware/errorMiddleware.ts
import { isRejectedWithValue } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const errorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    toast.error(action.payload?.message || 'Something went wrong')
  }
  return next(action)
}

// middleware/analyticsMiddleware.ts
export const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  // Log actions to analytics
  if (action.type.startsWith('user/')) {
    analytics.track(action.type, action.payload)
  }
  return next(action)
}
```

### Listener Middleware (New!)

```typescript
import { createListenerMiddleware } from '@reduxjs/toolkit'

const listenerMiddleware = createListenerMiddleware()

// React to specific actions
listenerMiddleware.startListening({
  actionCreator: userLoggedIn,
  effect: async (action, listenerApi) => {
    // Wait for other actions
    await listenerApi.condition((action) => action.type === 'data/loaded')
    
    // Access state
    const state = listenerApi.getState()
    
    // Dispatch more actions
    listenerApi.dispatch(loadUserPreferences(action.payload.userId))
  },
})

// Add to store
configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})
```

---

## 🧪 Testing Redux

### Testing Slices

```typescript
// features/auth/authSlice.test.ts
import authReducer, { login, logout } from './authSlice'

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
  }

  it('should handle login', () => {
    const user = { id: '1', name: 'John' }
    const actual = authReducer(initialState, login(user))
    expect(actual.user).toEqual(user)
    expect(actual.isAuthenticated).toBe(true)
  })

  it('should handle logout', () => {
    const loggedInState = { user: { id: '1' }, isAuthenticated: true }
    const actual = authReducer(loggedInState, logout())
    expect(actual.user).toBeNull()
    expect(actual.isAuthenticated).toBe(false)
  })
})
```

### Testing with Mock Store

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

function renderWithRedux(
  component,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
  } = {}
) {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  }
}

test('shows user name when logged in', () => {
  renderWithRedux(<UserProfile />, {
    preloadedState: {
      auth: { user: { name: 'John' }, isAuthenticated: true },
    },
  })
  
  expect(screen.getByText('John')).toBeInTheDocument()
})
```

---

## 🎨 Real-World Patterns

### Pessimistic vs Optimistic Updates

```typescript
// Pessimistic (wait for server)
const handleUpdate = async () => {
  try {
    await updateProduct(data).unwrap()
    toast.success('Updated!')
  } catch {
    toast.error('Failed!')
  }
}

// Optimistic (update UI immediately)
const handleUpdate = () => {
  // Update UI first
  dispatch(productUpdated(data))
  
  // Then sync with server
  updateProduct(data)
    .unwrap()
    .catch(() => {
      // Rollback on error
      dispatch(productUpdated(originalData))
      toast.error('Failed to save')
    })
}
```

### Undo/Redo Pattern

```typescript
const historySlice = createSlice({
  name: 'history',
  initialState: {
    past: [],
    present: null,
    future: [],
  },
  reducers: {
    actionPerformed: (state, action) => {
      state.past.push(state.present)
      state.present = action.payload
      state.future = []
    },
    undo: (state) => {
      if (state.past.length > 0) {
        state.future.unshift(state.present)
        state.present = state.past.pop()
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        state.past.push(state.present)
        state.present = state.future.shift()
      }
    },
  },
})
```

### Pagination & Infinite Scroll

```typescript
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    page: 1,
    hasMore: true,
    loading: false,
  },
  reducers: {
    loadMore: (state) => {
      if (!state.loading && state.hasMore) {
        state.page += 1
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.items.push(...action.payload.products)
      state.hasMore = action.payload.hasMore
      state.loading = false
    })
  },
})
```

---

## 🐛 Debugging Tools

### Redux DevTools Configuration

```typescript
const store = configureStore({
  reducer: rootReducer,
  devTools: {
    maxAge: 50,
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      password: undefined, // Hide sensitive data
    }),
  },
})
```

### Time-Travel Debugging

In Redux DevTools:
1. Click any action
2. State shows at that point
3. "Jump" to that state
4. Replay actions from there

---

## ✅ Production Checklist

- [x] Use TypeScript for type safety
- [x] Normalize state with `createEntityAdapter`
- [x] Implement error handling middleware
- [x] Use RTK Query for API calls
- [x] Add loading & error states everywhere
- [x] Implement optimistic updates for better UX
- [x] Use selectors for derived data
- [x] Test slices and critical flows
- [x] Configure DevTools properly
- [x] Handle token refresh in API layer
- [x] Persist necessary state (auth tokens)
- [x] Sanitize sensitive data in DevTools
- [x] Implement proper TypeScript types
- [x] Use feature-based folder structure

---

## 🎯 Best Practices Summary

1. **Keep state minimal** – Only store what can't be derived
2. **Use selectors** – Don't compute in components
3. **Normalize data** – Use entity adapters for lists
4. **Handle loading states** – Show proper feedback
5. **Type everything** – TypeScript prevents bugs
6. **Test critical paths** – Auth, payments, etc.
7. **Use RTK Query** – Don't reinvent API layer
8. **Optimize re-renders** – Use `useSelector` wisely

---

## 📚 What's Next?

Want more advanced topics?

- ✨ Redux + Next.js (SSR/SSG)
- ✨ Redux + React Native
- ✨ Advanced caching strategies
- ✨ Real-time with Redux (WebSockets)
- ✨ Redux vs Zustand vs Jotai
- ✨ Complete e-commerce example

---

## 📝 License

MIT © 2024

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Happy Coding!** 💪🚀