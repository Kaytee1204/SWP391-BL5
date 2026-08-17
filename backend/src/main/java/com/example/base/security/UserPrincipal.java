package com.example.base.security;

import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long accountId;
    private String email;
    private String fullName;

    @JsonIgnore
    private String password;

    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(Account account) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + account.getRole().name()),
                new SimpleGrantedAuthority(account.getRole().name())
        );

        boolean isEnabled = account.getStatus() == AccountStatus.active && account.getDeletedAt() == null;

        return UserPrincipal.builder()
                .accountId(account.getAccountId())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .password(account.getPasswordHash())
                .enabled(isEnabled)
                .authorities(authorities)
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
