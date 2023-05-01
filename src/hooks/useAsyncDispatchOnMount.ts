/* eslint-disable react-hooks/exhaustive-deps */
import { useAppDispatch } from '@/store/store';
import { AsyncThunkAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';

/**
 * dispatches an async thunk when component mounts
 * to the screen
 * @param actionCaller
 * @returns dispatch to avoid redundancy with calling useDispatch
 */
export default function useAsyncDispatchOnMount(
  actionCaller: AsyncThunkAction<unknown, void, any>
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(actionCaller);
    return () => promise.abort();
  }, [dispatch]);

  return dispatch;
}
