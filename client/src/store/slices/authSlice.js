import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('curedocs_user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: stored ? JSON.parse(stored) : null,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.userInfo = payload;
      localStorage.setItem('curedocs_user', JSON.stringify(payload));
    },
    logout(state) {
      state.userInfo = null;
      localStorage.removeItem('curedocs_user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
