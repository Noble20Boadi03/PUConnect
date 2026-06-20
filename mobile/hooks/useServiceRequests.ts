import { useServiceRequestsStore } from '../store/serviceRequestsStore';
import type { ServiceRequestsState } from '../store/serviceRequestsStore';

export function useServiceRequests<T = ServiceRequestsState>(selector?: (state: ServiceRequestsState) => T): T {
  return useServiceRequestsStore(selector ?? ((s) => s as unknown as T));
}

export default useServiceRequests;
