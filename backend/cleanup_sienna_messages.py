import requests
import json
from datetime import datetime

# Supabase credentials (SERVICE ROLE KEY for writes)
SUPABASE_URL = "https://okgwzwdtuhhpoyxyprzg.supabase.co"
SUPABASE_BRAIN_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw"

def delete_all_sienna_messages():
    """Delete all Sienna bot messages from war-room"""

    url = f"{SUPABASE_URL}/rest/v1/chat_messages"
    headers = {
        "apikey": SUPABASE_BRAIN_SERVICE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    print("Fetching all Sienna messages...")
    
    # Get all messages (paginated if needed)
    get_response = requests.get(
        f"{url}?select=*&is_bot=eq.true&sender_id=eq.424184493",
        headers=headers
    )
    
    if get_response.status_code == 200:
        data = get_response.json()
        all_messages = data if isinstance(data, dict) else data.get('data', [])
        
        sienna_messages = [m for m in all_messages if m.get('sender_id') == "424184493" and m.get('is_bot') == True]
        
        print(f"Found {len(sienna_messages)} Sienna messages")
        
        # Delete each one
        deleted_count = 0
        for msg in sienna_messages:
            delete_response = requests.delete(f"{url}?id=eq.{msg['id']}", headers=headers)
            if delete_response.status_code == 204:
                print(f"Deleted: {msg['id']} - {msg['content'][:50]}")
                deleted_count += 1
            else:
                print(f"Failed to delete: {msg['id']} - {delete_response.status_code}")
        
        print(f"\nTotal deleted: {deleted_count}")
        
        # Verify all are gone
        verify_response = requests.get(
            f"{url}?select=*&is_bot=eq.true&sender_id=eq.424184493",
            headers=headers
        )
        
        if verify_response.status_code == 200:
            data = verify_response.json()
            remaining_messages = data if isinstance(data, dict) else data.get('data', [])
            sienna_count = len([m for m in remaining_messages if m.get('sender_id') == "424184493" and m.get('is_bot') == True])
            
            print(f"Remaining Sienna messages: {sienna_count}")
            if sienna_count == 0:
                print("SUCCESS: All Sienna messages deleted")
            else:
                print(f"WARNING: {sienna_count} messages remain")
        else:
            print("Verification failed")

if __name__ == "__main__":
    delete_all_sienna_messages()
