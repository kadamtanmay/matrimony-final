package com.matrimony.Service;

import com.matrimony.Entity.PendingRequest;
import java.util.List;

public interface PendingRequestService {
  void saveRequest(PendingRequest request);
  List<PendingRequest> getPendingRequestsByUserId(Long userId);
  void updateRequestStatus(Long requestId, String status);
  int countPendingRequests(Long userId);
  boolean isConnected(Long userId1, Long userId2);
  boolean hasSentRequest(Long senderId, Long receiverId);
}
