import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserLabel } from '../../models';

interface UserState {
  user: User;
}

const initialState: UserState = {
  user: {} as User,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    updateUserLabels(state, action: PayloadAction<UserLabel[]>) {
      state.user.user_labels = action.payload;
    },
  },
});

export const { setUser, updateUserLabels } = userSlice.actions;
export default userSlice.reducer;