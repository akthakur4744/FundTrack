import { createSlice, configureStore } from '@reduxjs/toolkit';

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// UI slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light' as 'light' | 'dark',
    currency: 'USD',
    expenseFilter: 'all',
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setExpenseFilter: (state, action) => {
      state.expenseFilter = action.payload;
    },
  },
});

// Create store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { setUser, setLoading, setError } = authSlice.actions;
export const { setTheme, setCurrency, setExpenseFilter } = uiSlice.actions;
