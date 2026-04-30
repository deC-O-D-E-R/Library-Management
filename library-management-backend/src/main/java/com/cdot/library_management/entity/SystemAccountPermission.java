package com.cdot.library_management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_account_permissions")
public class SystemAccountPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private SystemAccount account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public SystemAccount getAccount() { return account; }
    public void setAccount(SystemAccount account) { this.account = account; }

    public Permission getPermission() { return permission; }
    public void setPermission(Permission permission) { this.permission = permission; }
}