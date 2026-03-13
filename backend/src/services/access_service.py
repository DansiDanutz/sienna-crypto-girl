from __future__ import annotations

from datetime import datetime, timezone
import hashlib
from typing import Any, Dict, Optional

from fastapi import Header, HTTPException

from src.services.supabase_service import SupabaseService


class AccessService:
    """Validates paid-member API keys against the ZmartyBrain project."""

    def __init__(self, supabase_service: SupabaseService):
        self.supabase_service = supabase_service

    @staticmethod
    def _hash_api_key(api_key: str) -> str:
        return hashlib.sha256(api_key.encode("utf-8")).hexdigest()

    def _parse_api_key(self, x_api_key: Optional[str], authorization: Optional[str]) -> str:
        if x_api_key and x_api_key.strip():
            return x_api_key.strip()

        if authorization:
            parts = authorization.split(" ", 1)
            if len(parts) == 2 and parts[0].lower() == "bearer":
                return parts[1].strip()

        raise HTTPException(status_code=401, detail="Missing API key.")

    async def require_paid_access(
        self,
        x_api_key: Optional[str] = Header(default=None),
        authorization: Optional[str] = Header(default=None),
    ) -> Dict[str, Any]:
        api_key = self._parse_api_key(x_api_key, authorization)

        if not self.supabase_service.brain_client:
            raise HTTPException(status_code=503, detail="ZmartyBrain client is not configured.")

        key_hash = self._hash_api_key(api_key)

        try:
            key_result = (
                self.supabase_service.brain_client.table("api_keys")
                .select("*")
                .eq("key_hash", key_hash)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"API key lookup failed: {exc}") from exc

        key_rows = key_result.data or []
        if not key_rows:
            raise HTTPException(status_code=401, detail="Invalid API key.")

        key_record = key_rows[0]
        if not key_record.get("is_active", False) or key_record.get("revoked_at"):
            raise HTTPException(status_code=403, detail="API key is inactive.")

        user_id = key_record.get("user_id")
        if not user_id:
            raise HTTPException(status_code=403, detail="API key is not linked to a member.")

        try:
            profile_result = (
                self.supabase_service.brain_client.table("member_profiles")
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Member profile lookup failed: {exc}") from exc

        profile_rows = profile_result.data or []
        if not profile_rows:
            raise HTTPException(status_code=403, detail="Member profile not found.")

        profile = profile_rows[0]
        if not profile.get("api_access_enabled", False):
            raise HTTPException(status_code=403, detail="This membership tier does not have API access enabled.")

        if profile.get("subscription_status") not in {"active", "trialing"}:
            raise HTTPException(status_code=403, detail="Subscription is not active.")

        try:
            (
                self.supabase_service.brain_client.table("api_keys")
                .update({"last_used_at": datetime.now(timezone.utc).isoformat()})
                .eq("id", key_record["id"])
                .execute()
            )
        except Exception:
            pass

        return {
          "user_id": user_id,
          "tier": profile.get("tier", "free"),
          "email": profile.get("email"),
          "api_key_id": key_record.get("id"),
        }
