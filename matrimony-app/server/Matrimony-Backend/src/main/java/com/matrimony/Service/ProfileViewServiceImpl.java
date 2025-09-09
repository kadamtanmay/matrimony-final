package com.matrimony.Service;

import com.matrimony.Dao.ProfileViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileViewServiceImpl implements ProfileViewService {

    @Autowired
    private ProfileViewRepository profileViewDao;

    @Override
    public long countProfileViews(Long userId) {
        return profileViewDao.countByViewedUserId(userId);
    }
}
