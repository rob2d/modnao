/* eslint-disable react-hooks/exhaustive-deps */
import { useAppDispatch } from '@/store/store';
import { AsyncThunkAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';

export default function useAsyncDispatchOnFirstRender(
  actionCaller: AsyncThunkAction<unknown, void, any>
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(actionCaller);
    return () => promise.abort();
  }, [dispatch]);
}
