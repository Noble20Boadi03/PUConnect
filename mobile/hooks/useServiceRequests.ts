import { useServiceRequestsStore } from '../store/serviceRequestsStore';

export function useServiceRequests() {
  return useServiceRequestsStore();
}

export default useServiceRequests;
