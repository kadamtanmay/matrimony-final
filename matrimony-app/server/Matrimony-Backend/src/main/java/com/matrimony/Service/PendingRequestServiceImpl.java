package com.matrimony.Service;

import com.matrimony.Dao.PendingRequestDao;
import com.matrimony.Entity.PendingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PendingRequestServiceImpl implements PendingRequestService {

  @Autowired private PendingRequestDao dao;

  @Override
  public void saveRequest(PendingRequest request) {
    dao.save(request);
  }

  @Override
  public List<PendingRequest> getPendingRequestsByUserId(Long userId) {
    return dao.findAll() // filter in code or add query for status=PENDING
              .stream().filter(r -> r.getReceiver().getId().equals(userId)
                                  && r.getStatus().equals(PendingRequest.STATUS_PENDING))
              .toList();
  }

  @Override
  public void updateRequestStatus(Long requestId, String status) {
    PendingRequest r = dao.findById(requestId).orElseThrow();
    r.setStatus(status);
    dao.save(r);
  }

  @Override
  public int countPendingRequests(Long userId) {
    return dao.countPendingByUserId(userId, PendingRequest.STATUS_PENDING);
  }

  @Override
  public boolean isConnected(Long u1, Long u2) {
    return dao.existsAcceptedConnection(u1, u2, PendingRequest.STATUS_ACCEPTED);
  }

  @Override
  public boolean hasSentRequest(Long senderId, Long receiverId) {
    return dao.existsBySenderAndReceiver(senderId, receiverId);
  }
}
