import { useServiceRequestsStore } from '../store/serviceRequestsStore';
import type { ServiceRequestsState } from '../store/serviceRequestsStore';
import { useShallow } from 'zustand/react/shallow';

export function useServiceRequests<T = ServiceRequestsState>(selector?: (state: ServiceRequestsState) => T): T {
  if (selector) {
    return useServiceRequestsStore(selector);
  }
  return useServiceRequestsStore(useShallow((s) => s as unknown as T));
}

export default useServiceRequests;
