import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase credentials are missing from .env")

supabase: Client = create_client(supabase_url, supabase_key)

def log_ticket_activity(
    ticket_id: str,
    activity_type: str,
    description: str
):
    try:
        supabase.table("ticket_activities").insert({
            "ticket_id": ticket_id,
            "activity_type": activity_type,
            "description": description,
        }).execute()

    except Exception as e:
        print(f"Activity logging failed: {e}")



import requests
from apscheduler.schedulers.background import BackgroundScheduler
from gmail_service import fetch_potential_support_emails
from email.utils import parseaddr
from datetime import datetime




BASE_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")



def is_email_already_imported(message_id):
    """Check whether a Gmail email already has a ticket."""

    response = (
        supabase.table("tickets")
        .select("id")
        .eq("gmail_message_id", message_id)
        .execute()
    )

    return bool(response.data)



def is_message_already_synced(message_id):
    """Check whether a Gmail message already exists in Supabase."""

    response = (
        supabase.table("messages")
        .select("id")
        .eq("gmail_message_id", message_id)
        .execute()
    )

    return bool(response.data)


def get_ticket_by_thread_id(thread_id):
    """Find an existing ticket using its Gmail thread ID."""

    response = (
        supabase.table("tickets")
        .select("id, email, gmail_thread_id, gmail_message_id")
        .eq("gmail_thread_id", thread_id)
        .execute()
    )

    return response.data[0] if response.data else None

def import_support_emails():
    """Fetch and import potential support emails."""

    print(
    f"\nChecking Gmail at: {datetime.now().strftime('%H:%M:%S')}"
     )

    try:
        emails = fetch_potential_support_emails(max_results=20)

        for email in emails:
            message_id = email["id"]
            thread_id = email.get("thread_id")

            # Skip messages already synchronized
            if is_message_already_synced(message_id):
                print("Already synced:", email["subject"])
                continue

            # Check whether this message belongs to an existing ticket
            existing_ticket = get_ticket_by_thread_id(thread_id)

            if existing_ticket:
                # Skip the original email of an already-created ticket
                if existing_ticket.get("gmail_message_id") == message_id:
                    print("Original email already imported:", email["subject"])
                    continue

                # Add the new customer reply to the existing ticket
                message = email.get("body") or email.get("snippet", "")
                sender_name, sender_email = parseaddr(email["from"])
                
                print("Reply sender:", sender_email)
                print("Ticket customer:", existing_ticket["email"])

                # Only sync replies sent by the customer
                if sender_email.lower() == existing_ticket["email"].lower():
                                        
                    # Save the customer reply
                    supabase.table("messages").insert({
                        "ticket_id": existing_ticket["id"],
                        "sender": "customer",
                        "content": message,
                        "gmail_message_id": message_id
                    }).execute()
                    log_ticket_activity(
                        existing_ticket["id"],
                        "Customer Replied",
                        "Customer replied to the ticket by email"
                    )
                    
                    # Reopen the ticket when the customer replies
                    supabase.table("tickets").update({
                        "status": "Open"
                    }).eq("id", existing_ticket["id"]).execute()

                    print("Ticket reopened:", existing_ticket["id"])


                    # Re-classify the ticket based on the customer's new reply
                    classification_response = requests.post(
                        f"{BASE_URL}/classify-ticket",
                        json={
                            "subject": email.get("subject", ""),
                            "message": message
                        },
                        timeout=30
                    )

                    if classification_response.ok:
                        classification = classification_response.json()

                        # Update category and priority using the latest customer message
                        supabase.table("tickets").update({
                            "category": classification["category"],
                            "priority": classification["priority"]
                        }).eq("id", existing_ticket["id"]).execute()
                        log_ticket_activity(
                            existing_ticket["id"],
                            "AI Reclassified",
                            f"AI updated category to {classification['category']} and priority to {classification['priority']}"
                        )

                        print(
                            "Ticket re-classified:",
                            classification["category"],
                            "| Priority:",
                            classification["priority"]
                        )
                    else:
                        print(
                            "Ticket re-classification failed:",
                            classification_response.text
                        )
                    
                    
                    # Generate a fresh AI reply suggestion
                    reply_response = requests.post(
                        f"{BASE_URL}/generate-reply",
                        json={
                            "ticket_id": existing_ticket["id"],
                            "subject": email.get("subject", ""),
                            "category": classification["category"],
                            "message": message
                        },
                        timeout=60
                    )

                    if reply_response.ok:
                        reply = reply_response.json()["reply"]

                        # Save the new AI suggestion
                        suggestion_response = requests.post(
                            f"{BASE_URL}/tickets/{existing_ticket['id']}/messages",
                            json={
                                "sender": "ai_suggestion",
                                "content": reply
                            },
                            timeout=30
                        )

                        if suggestion_response.ok:
                            log_ticket_activity(
                                existing_ticket["id"],
                                "AI Reply Generated",
                                "AI generated a new reply suggestion based on the customer conversation"
                            )

                            print("New AI Reply Suggestion saved successfully!")
                        else:
                            print(
                                "Failed to save new AI suggestion:",
                                suggestion_response.text
                            )
                    else:
                        print(
                            "Reply generation failed:",
                            reply_response.text
                        )

                    # Analyze the sentiment of the new reply
                    sentiment_response = requests.post(
                        f"{BASE_URL}/analyze-sentiment",
                        json={
                            "subject": email.get("subject", ""),
                            "message": message
                        },
                        timeout=30
                     )

                    if sentiment_response.ok:
                        sentiment = sentiment_response.json()["sentiment"]

                        # Update the ticket's sentiment
                        supabase.table("tickets").update({
                            "sentiment": sentiment
                        }).eq("id", existing_ticket["id"]).execute()

                        log_ticket_activity(
                            existing_ticket["id"],
                            "Sentiment Updated",
                            f"AI analyzed the customer reply as {sentiment} sentiment"
                        )

                        print("Sentiment updated:", sentiment)
                    else:
                        print("Sentiment analysis failed:", sentiment_response.text)

                    print("Customer reply synced:", email["subject"])

                    
                    
                    
                else:
                    print("Skipping non-customer email:", email["subject"])

                continue

            # No existing ticket: check whether this is an already imported original email
            if is_email_already_imported(message_id):
                print("Already imported:", email["subject"])
                continue

            sender_name, sender_email = parseaddr(email["from"])
            message = email.get("body") or email.get("snippet", "")

            # Classify the email
            classification_response = requests.post(
                f"{BASE_URL}/classify-ticket",
                json={
                    "subject": email["subject"],
                    "message": message
                },
                timeout=30
            )

            if not classification_response.ok:
                print("Classification failed:", classification_response.text)
                continue

            classification = classification_response.json()
            
            
            # Analyze the sentiment of the email
            sentiment_response = requests.post(
                f"{BASE_URL}/analyze-sentiment",
                json={
                    "subject": email["subject"],
                    "message": message
                },
                timeout=30
            )

            if sentiment_response.ok:
                sentiment = sentiment_response.json()["sentiment"]
                print("Initial sentiment analyzed:", sentiment)
            else:
                sentiment = "Not analyzed"
                print("Initial sentiment analysis failed:", sentiment_response.text)

            # Prepare ticket data
            ticket_payload = {
                "subject": email["subject"],
                "customer": sender_name or sender_email,
                "email": sender_email,
                "message": message,
                "html_body": email.get("html_body"),
                "priority": classification["priority"],
                "category": classification["category"],
                "sentiment": sentiment,
                "gmail_message_id": email["id"],
                "gmail_thread_id": email.get("thread_id"),
                "gmail_original_message_id": email.get("original_message_id")
            }

            # Create the ticket
            ticket_response = requests.post(
                f"{BASE_URL}/tickets",
                json=ticket_payload,
                timeout=30
            )

            if ticket_response.ok:
                    result = ticket_response.json()

                    if result.get("message") == "Email already imported":
                        print("Already imported:", email["subject"])
                    else:
                        ticket_id = result["id"]

                        print("Ticket created:", email["subject"])
                        print("Ticket ID:", ticket_id)
                        
                       
                                

                           # Generate AI reply suggestion
                        reply_response = requests.post(
                            f"{BASE_URL}/generate-reply",
                            json={
                                "ticket_id": ticket_id,
                                "subject": email["subject"],
                                "category": classification["category"],
                                "message": message
                            },
                            timeout=60
                        )

                        if reply_response.ok:
                            reply = reply_response.json()["reply"]

                            # Save AI suggestion in the database
                            suggestion_response = requests.post(
                                f"{BASE_URL}/tickets/{ticket_id}/messages",
                                json={
                                    "sender": "ai_suggestion",
                                    "content": reply
                                },
                                timeout=30
                            )

                            if suggestion_response.ok:
                                print("AI Reply Suggestion saved successfully!")
                                print(reply)
                            else:
                                print(
                                    "Failed to save AI suggestion:",
                                    suggestion_response.text
                                )
                        else:
                            print("Reply generation failed:", reply_response.text)
                                                    
                            
                        #------------------------

            else:
                    print("Ticket creation failed:", ticket_response.text)
                                
                

    except Exception as e:
        print("Gmail import error:", e)


scheduler = BackgroundScheduler()

scheduler.add_job(
    import_support_emails,
    trigger="interval",
    minutes=5,
    id="gmail_import_job",
    max_instances=1,
    coalesce=True
)


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        print("Gmail scheduler started. Checking every 5 minutes.")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("Gmail scheduler stopped.")