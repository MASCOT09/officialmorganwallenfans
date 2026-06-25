"use client";

import { useState } from "react";
import {
  changeUserRoleAction,
  setMembershipBadgeAction,
  deleteFanAction,
} from "@/actions/admin";
import { getCountryName } from "@/lib/countries";
import type { AdminUserSummary, CommunityStats } from "@/lib/types";
import type { MembershipTier, UserRole } from "@/lib/types";

export function TeamAdminClient({
  fans,
  admins,
  stats,
  currentUserId,
}: {
  fans: AdminUserSummary[];
  admins: AdminUserSummary[];
  stats: CommunityStats;
  currentUserId: string;
}) {
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const allUsers = [...admins, ...fans.filter((f) => !admins.some((a) => a.id === f.id))];

  async function handleAction(fn: () => Promise<{ success: boolean; error?: string }>) {
    const result = await fn();
    setBanner(
      result.success
        ? { type: "success", msg: "Action completed." }
        : { type: "error", msg: result.error ?? "Something went wrong." },
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Team & Admins</h1>
        <p className="text-muted">Manage fans, roles, and membership badges.</p>
      </div>

      {banner && (
        <div
          className={`rounded-xl p-4 text-sm ${
            banner.type === "success" ? "bg-secondary/20 text-secondary" : "bg-red-400/10 text-red-400"
          }`}
        >
          {banner.msg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display text-accent">{stats.total_fans}</p>
          <p className="text-xs text-muted">Total fans</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display">{stats.tier_silver}</p>
          <p className="text-xs text-muted">Silver</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display">{stats.tier_gold}</p>
          <p className="text-xs text-muted">Gold</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display">{stats.tier_platinum}</p>
          <p className="text-xs text-muted">Platinum</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display">{stats.tier_none}</p>
          <p className="text-xs text-muted">None</p>
        </div>
      </div>

      <section className="glass-card p-6">
        <h2 className="font-display text-lg">Fans by country</h2>
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
          {stats.by_country.slice(0, 20).map((c) => (
            <li key={c.country} className="flex justify-between">
              <span>{getCountryName(c.country)}</span>
              <span className="text-muted">{c.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-muted">
              <th className="p-3">Fan</th>
              <th className="p-3">Role</th>
              <th className="p-3">Badge</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.id} className="border-b border-card-border/50">
                <td className="p-3">
                  <p className="font-medium">{u.display_name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="p-3">
                  <select
                    defaultValue={u.role}
                    disabled={u.id === currentUserId}
                    onChange={(e) =>
                      handleAction(() => changeUserRoleAction(u.id, e.target.value as UserRole))
                    }
                    className="input-field py-1 text-xs"
                  >
                    <option value="fan">Fan</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    defaultValue={u.membership_tier}
                    onChange={(e) =>
                      handleAction(() =>
                        setMembershipBadgeAction(u.id, e.target.value as MembershipTier),
                      )
                    }
                    className="input-field py-1 text-xs"
                  >
                    <option value="none">None</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </td>
                <td className="p-3">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${u.display_name}? This cannot be undone.`)) {
                          handleAction(() => deleteFanAction(u.id));
                        }
                      }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
