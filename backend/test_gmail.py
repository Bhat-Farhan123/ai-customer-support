
import requests
from gmail_service import fetch_potential_support_emails
from email.utils import parseaddr

BASE_URL = "http://127.0.0.1:8000"

try:
    emails = fetch_potential_support_emails(max_results=20)

    print("\nGmail to Support Ticket Import\n")

    if not emails:
        print("No potential support emails found.")

    for email in emails:
        print("-" * 50)
        print("Subject:", email["subject"])
        
        print("\nFull email body:")
        print(email["body"])

        # Extract sender's name and email address
        sender_name, sender_email = parseaddr(email["from"])

        # Classify the email
        classification_response = requests.post(
            f"{BASE_URL}/classify-ticket",
            json={
                "subject": email["subject"],
                "message": email["body"] or email["snippet"]
            },
            timeout=30
        )

        if not classification_response.ok:
            print("Classification failed:", classification_response.text)
            continue

        classification = classification_response.json()

        # Prepare the ticket
        ticket_payload = {
            "subject": email["subject"],
            "customer": sender_name or sender_email,
            "email": sender_email,
            "message": email["snippet"],
            "priority": classification["priority"],
            "category": classification["category"],
            "sentiment": "Not analyzed",
            "gmail_message_id": email["id"]
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
                print("Status: Already imported")
                print("Ticket ID:", result["ticket_id"])
            else:
                print("Status: Ticket created")
                print("Ticket ID:", result["id"])
                print("Category:", result["category"])
                print("Priority:", result["priority"])
        else:
            print("Ticket creation failed:", ticket_response.text)

except requests.exceptions.ConnectionError:
    print("Could not connect to the backend. Is FastAPI running?")

except Exception as e:
    print("Error:", e)