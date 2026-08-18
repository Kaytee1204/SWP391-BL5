package com.example.base.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// ============================================================================
// FILTER NÀY CHẠY TRƯỚC MỌI REQUEST ĐỂ KIỂM TRA TOKEN (JWT)
// ============================================================================
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            // BƯỚC 1: Lấy chuỗi JWT từ header 'Authorization: Bearer <token>'
            String jwt = getJwtFromRequest(request);

            // BƯỚC 2: Kiểm tra token có hợp lệ không (chưa hết hạn, đúng chữ ký)
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                
                // BƯỚC 3: Giải mã token để lấy email của user
                String email = tokenProvider.getEmailFromJwt(jwt);

                // BƯỚC 4: Load thông tin user và quyền hạn (Role) từ Database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                
                // BƯỚC 5: Đóng gói user vào đối tượng Authentication của Spring Security
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // BƯỚC 6: Lưu Authentication vào SecurityContext (để Controller có thể lấy qua @AuthenticationPrincipal)
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Không thể xác thực người dùng trong Security Context", ex);
        }

        // BƯỚC 7: Cho phép request tiếp tục đi tới Filter tiếp theo hoặc tới Controller
        filterChain.doFilter(request, response);
    }

    /**
     * Hàm phụ trợ: Bóc tách token từ Header "Authorization: Bearer abcxyz..."
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Cắt bỏ chữ 'Bearer ' lấy phần token phía sau
        }
        return null;
    }
}
