package com.example.base.service.culture.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.culture.CultureArticleCreateRequest;
import com.example.base.dto.culture.CultureArticleResponse;
import com.example.base.dto.culture.CultureArticleUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.CultureArticle;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.CultureArticleMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.CultureArticleRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.culture.CultureArticleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CultureArticleServiceImpl implements CultureArticleService {

    private final CultureArticleRepository cultureArticleRepository;
    private final AccountRepository accountRepository;
    private final CultureArticleMapper cultureArticleMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CultureArticleResponse> searchArticles(String keyword, String status, Pageable pageable) {
        Specification<CultureArticle> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isBlank()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), searchPattern));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toLowerCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CultureArticle> page = cultureArticleRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(cultureArticleMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CultureArticleResponse> searchMyArticles(String keyword, String status, UserPrincipal currentUser, Pageable pageable) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Authentication required to view your articles");
        }

        Specification<CultureArticle> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("author").get("accountId"), currentUser.getAccountId()));
            if (keyword != null && !keyword.isBlank()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), searchPattern));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toLowerCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CultureArticle> page = cultureArticleRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(cultureArticleMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public CultureArticleResponse getArticleById(Long articleId) {
        CultureArticle article = cultureArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("CultureArticle", "id", articleId));
        return cultureArticleMapper.toResponse(article);
    }

    // ------------------------------------------------------------------------
    // HÀM TẠO BÀI VIẾT MỚI (CREATE)
    // ------------------------------------------------------------------------
    @Override
    @Transactional
    public CultureArticleResponse createArticle(CultureArticleCreateRequest request, UserPrincipal currentUser) {
        // BƯỚC 1: Kiểm tra xem user đã đăng nhập chưa
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện chức năng này!");
        }

        // BƯỚC 2: Kiểm tra xem user có đúng role Author không
        boolean isAuthor = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Author") || a.equalsIgnoreCase("Author"));

        if (!isAuthor) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ tài khoản Author mới có quyền đăng bài viết văn hóa!");
        }

        // BƯỚC 3: Lấy thông tin Account của tác giả từ database
        Account author = accountRepository.findById(currentUser.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", currentUser.getAccountId()));

        // BƯỚC 4: Chuyển đổi DTO Request -> Entity CultureArticle
        CultureArticle article = cultureArticleMapper.toEntity(request, author);
        
        // BƯỚC 5: Lưu xuống cơ sở dữ liệu SQL Server
        CultureArticle saved = cultureArticleRepository.save(article);

        log.info("Created new culture article: id={}, title='{}', author='{}'", 
                saved.getArticleId(), saved.getTitle(), author.getEmail());

        // BƯỚC 6: Chuyển Entity đã lưu -> DTO Response để trả về cho Controller
        return cultureArticleMapper.toResponse(saved);
    }

    // ------------------------------------------------------------------------
    // HÀM CẬP NHẬT BÀI VIẾT (UPDATE)
    // ------------------------------------------------------------------------
    @Override
    @Transactional
    public CultureArticleResponse updateArticle(Long articleId, CultureArticleUpdateRequest request, UserPrincipal currentUser) {
        // BƯỚC 1: Kiểm tra đăng nhập
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để cập nhật bài viết!");
        }

        // BƯỚC 2: Tìm bài viết trong database theo ID
        CultureArticle article = cultureArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("CultureArticle", "id", articleId));

        // BƯỚC 3: Kiểm tra quyền sở hữu (Chỉ người viết ra bài này mới được sửa)
        validateOwnership(article, currentUser);

        // BƯỚC 4: Cập nhật các trường dữ liệu từ DTO sang Entity
        cultureArticleMapper.updateEntityFromDto(request, article);
        
        // BƯỚC 5: Lưu thay đổi vào DB
        CultureArticle updated = cultureArticleRepository.save(article);

        log.info("Updated culture article: id={}, title='{}', updatedBy='{}'", 
                updated.getArticleId(), updated.getTitle(), currentUser.getEmail());

        // BƯỚC 6: Trả về DTO Response
        return cultureArticleMapper.toResponse(updated);
    }

    // ------------------------------------------------------------------------
    // HÀM XÓA BÀI VIẾT (DELETE)
    // ------------------------------------------------------------------------
    @Override
    @Transactional
    public void deleteArticle(Long articleId, UserPrincipal currentUser) {
        // BƯỚC 1: Kiểm tra đăng nhập
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để xóa bài viết!");
        }

        // BƯỚC 2: Tìm bài viết trong DB
        CultureArticle article = cultureArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("CultureArticle", "id", articleId));

        // BƯỚC 3: Kiểm tra quyền (Tác giả sở hữu bài HOẶC Manager có quyền xóa)
        validateOwnershipOrManager(article, currentUser);

        // BƯỚC 4: Xóa bài khỏi DB
        cultureArticleRepository.delete(article);
        
        log.info("Deleted culture article: id={}, title='{}', deletedBy='{}'", 
                articleId, article.getTitle(), currentUser.getEmail());
    }

    /**
     * Hàm phụ trợ kiểm tra quyền: Phải đúng là tác giả tạo ra bài viết mới được sửa
     */
    private void validateOwnership(CultureArticle article, UserPrincipal currentUser) {
        boolean isAuthorOwner = article.getAuthor() != null && 
                article.getAuthor().getAccountId().equals(currentUser.getAccountId());

        if (!isAuthorOwner) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn chỉ có thể chỉnh sửa bài viết do chính bạn tạo!");
        }
    }

    /**
     * Hàm phụ trợ kiểm tra quyền: Manager hoặc chính tác giả bài viết mới được xóa
     */
    private void validateOwnershipOrManager(CultureArticle article, UserPrincipal currentUser) {
        boolean isManager = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        boolean isAuthorOwner = article.getAuthor() != null && 
                article.getAuthor().getAccountId().equals(currentUser.getAccountId());

        if (!isManager && !isAuthorOwner) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền xóa bài viết này (Cần là Tác giả bài viết hoặc Manager)!");
        }
    }
}
