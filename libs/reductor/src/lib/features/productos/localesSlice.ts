import { ILocal } from '@flash-ws/api-interfaces';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface LocalsState {
  locales?: ILocal[];
}

const initialState: LocalsState = {
  locales: undefined,
};

export const actualizarLocales: any = createAsyncThunk(
  'data/locales',
  async (httpClient: any) => {
    const response = await httpClient.get(
      `${process.env['NX_SERVER_URL']}/api/locales`
    );
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const localesSlice = createSlice({
  name: 'locales',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder.addCase(actualizarLocales.fulfilled, (state, action) => {
      state.locales = action.payload;
    });
  },
});

export default localesSlice.reducer;
