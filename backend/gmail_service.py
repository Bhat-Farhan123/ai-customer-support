

import os
import json

from pathlib import Path

import base64

from email.mime.text import MIMEText





from google.auth.transport.requests import Request

from google.oauth2.credentials import Credentials

from google_auth_oauthlib.flow import InstalledAppFlow

from googleapiclient.discovery import build



BASE_DIR = Path(__file__).resolve().parent



SCOPES = [

    "https://www.googleapis.com/auth/gmail.readonly",

    "https://www.googleapis.com/auth/gmail.send",

    "https://www.googleapis.com/auth/gmail.modify",

]



CREDENTIALS_FILE = BASE_DIR / "credentials.json"

TOKEN_FILE = BASE_DIR / "token.json"





def get_gmail_service():
    creds = None

    # Production: load Gmail OAuth token from environment variable
    gmail_token_json = os.getenv("GMAIL_TOKEN_JSON")

    if gmail_token_json:
        creds = Credentials.from_authorized_user_info(
            json.loads(gmail_token_json),
            SCOPES
        )

    # Local development: use token.json
    elif TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(
            str(TOKEN_FILE), SCOPES
        )

    # Refresh expired credentials
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())

        # In local development, save the refreshed token.
        # In production, keep the refreshed credentials in memory.
        if not gmail_token_json:
            with open(TOKEN_FILE, "w") as token:
                token.write(creds.to_json())

    # Local fallback: interactive OAuth
    if not creds or not creds.valid:
        if gmail_token_json:
            raise RuntimeError(
                "Gmail authentication is invalid or expired. "
                "Update GMAIL_TOKEN_JSON with a valid authorized Gmail token."
            )

        flow = InstalledAppFlow.from_client_secrets_file(
            str(CREDENTIALS_FILE), SCOPES
        )

        creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)







def fetch_recent_emails(max_results=10):

    """Fetch recent emails with their full body."""



    service = get_gmail_service()



    results = service.users().messages().list(

        userId="me",

        labelIds=["INBOX"],

        maxResults=max_results

    ).execute()



    messages = results.get("messages", [])

    emails = []



    for message in messages:

        msg = service.users().messages().get(

            userId="me",

            id=message["id"],

            format="full"

        ).execute()



        headers = msg.get("payload", {}).get("headers", [])



        subject = next(

            (h["value"] for h in headers if h["name"].lower() == "subject"),

            "(No Subject)"

        )



        sender = next(

            (h["value"] for h in headers if h["name"].lower() == "from"),

            ""

        )



        date = next(

            (h["value"] for h in headers if h["name"].lower() == "date"),

            ""

        )



        original_message_id = next(

            (

                h["value"]

                for h in headers

                if h["name"].lower() == "message-id"

            ),

            ""

        )



        body_parts = extract_email_parts(msg.get("payload", {}))

        body = body_parts["text"] or body_parts["html"]
        html_body = body_parts["html"]



        emails.append({
            "id": msg["id"],
            "thread_id": msg.get("threadId"),
            "original_message_id": original_message_id,
            "snippet": msg.get("snippet", ""),
            "from": sender,
            "subject": subject,
            "date": date,
            "body": body,
            "html_body": html_body,
        })



    return emails







def is_potential_support_email(subject, snippet):

    text = f"{subject} {snippet}".lower()



    support_keywords = [

        "order status",

        "where is my order",

        "track my order",

        "shipping",

        "shipping time",

        "delivery time",

        "refund request",

        "request a refund",

        "return my order",

        "payment failed",

        "charged twice",

        "wrong amount charged",

        "delivery issue",

        "not received",

        "not working",

        "broken",

        "damaged",

        "arrived damaged",

        "product issue",

        "defective product",

        "faulty product",

        "complaint",

        "cancel my order",

        "login problem",

        "can't access my account",

        "cannot access my account",

        "account locked",

        "technical issue",

        "need assistance with my order",

        "has not been delivered",

"not been delivered",

"haven't received",

"have not received",

"order has not arrived",

"delivery is delayed",

    ]



    return any(keyword in text for keyword in support_keywords)





def fetch_potential_support_emails(max_results=10):

    emails = fetch_recent_emails(max_results=max_results)



    support_emails = [

        email for email in emails

        if is_potential_support_email(

            email.get("subject", ""),

            email.get("body", "")

        )

    ]



    return support_emails











def extract_email_body(payload):

    """Extract the readable body from a Gmail message."""



    body_text = []

    body_html = []



    def process_parts(part):

        mime_type = part.get("mimeType", "")

        body_data = part.get("body", {}).get("data")



        if mime_type == "text/plain" and body_data:

            decoded = base64.urlsafe_b64decode(body_data).decode(

                "utf-8", errors="replace"

            )

            body_text.append(decoded)



        elif mime_type == "text/html" and body_data:

            decoded = base64.urlsafe_b64decode(body_data).decode(

                "utf-8", errors="replace"

            )

            body_html.append(decoded)



        for child in part.get("parts", []):

            process_parts(child)



    process_parts(payload)



    # Prefer plain text when available

    if body_text:

        return "\n".join(body_text).strip()



    # Fall back to HTML if no plain-text part exists

    if body_html:

        return "\n".join(body_html).strip()



    return ""

def extract_email_parts(payload):
    """Extract both plain-text and HTML versions of a Gmail message."""

    body_text = []
    body_html = []

    def process_parts(part):
        mime_type = part.get("mimeType", "")
        body_data = part.get("body", {}).get("data")

        if mime_type == "text/plain" and body_data:
            decoded = base64.urlsafe_b64decode(
                body_data + "=" * (-len(body_data) % 4)
            ).decode("utf-8", errors="replace")

            body_text.append(decoded)

        elif mime_type == "text/html" and body_data:
            decoded = base64.urlsafe_b64decode(
                body_data + "=" * (-len(body_data) % 4)
            ).decode("utf-8", errors="replace")

            body_html.append(decoded)

        for child in part.get("parts", []):
            process_parts(child)

    process_parts(payload)

    return {
        "text": "\n".join(body_text).strip(),
        "html": "\n".join(body_html).strip(),
    }
    

from email.mime.text import MIMEText





from email.utils import make_msgid



def send_email(

    to_email,

    subject,

    body,

    thread_id=None,

    original_message_id=None

):

    """Send a reply in an existing Gmail conversation."""



    service = get_gmail_service()



    message = MIMEText(body, "plain", "utf-8")

    message["to"] = to_email

    message["subject"] = subject



    if original_message_id:

        message["In-Reply-To"] = original_message_id

        message["References"] = original_message_id



    raw_message = base64.urlsafe_b64encode(

        message.as_bytes()

    ).decode("utf-8")



    email_data = {"raw": raw_message}



    if thread_id:

        email_data["threadId"] = thread_id



    result = service.users().messages().send(

        userId="me",

        body=email_data

    ).execute()



    return result







# ============================================================

# EMAIL MONITORING

# ============================================================



def get_gmail_label_stats():

    """

    Get mailbox statistics directly from Gmail labels.

    This gives us counts without downloading every email.

    """



    service = get_gmail_service()



    label_names = [

        "INBOX",

        "SENT",

        "SPAM",

        "TRASH",

        "UNREAD",

        "IMPORTANT",

        "STARRED",

        "CATEGORY_PROMOTIONS",

        "CATEGORY_SOCIAL",

        "CATEGORY_UPDATES",

        "CATEGORY_FORUMS",

        "CATEGORY_PERSONAL",

    ]



    stats = {}



    for label_name in label_names:

        try:

            response = (

                service.users()

                .labels()

                .get(

                    userId="me",

                    id=label_name

                )

                .execute()

            )



            stats[label_name] = {

                "total": response.get("messagesTotal", 0),

                "unread": response.get("messagesUnread", 0),

            }



        except Exception as e:

            print(f"Could not get Gmail label {label_name}: {e}")



            stats[label_name] = {

                "total": 0,

                "unread": 0,

            }



    return stats





def search_gmail_count(query):

    """

    Get Gmail's estimated count for a search query.

    """



    service = get_gmail_service()



    try:

        response = (

            service.users()

            .messages()

            .list(

                userId="me",

                q=query,

                maxResults=1

            )

            .execute()

        )



        return response.get("resultSizeEstimate", 0)



    except Exception as e:

        print(f"Gmail search count failed for '{query}': {e}")

        return 0





def fetch_monitor_emails(max_results=50):

    """

    Fetch recent emails for the Email Monitoring dashboard.



    Unlike fetch_potential_support_emails(), this function

    does NOT filter emails by support keywords.

    """



    service = get_gmail_service()



    try:

        results = (

            service.users()

            .messages()

            .list(

                userId="me",

                maxResults=max_results

            )

            .execute()

        )



        messages = results.get("messages", [])

        emails = []



        for message in messages:



            msg = (

                service.users()

                .messages()

                .get(

                    userId="me",

                    id=message["id"],

                    format="full"

                )

                .execute()

            )



            headers = msg.get("payload", {}).get("headers", [])



            def get_header(name):

                return next(

                    (

                        h["value"]

                        for h in headers

                        if h["name"].lower() == name.lower()

                    ),

                    ""

                )



            sender = get_header("from")

            subject = get_header("subject") or "(No Subject)"

            date = get_header("date")



            labels = msg.get("labelIds", [])



            emails.append({

                "id": msg.get("id"),

                "thread_id": msg.get("threadId"),

                "from": sender,

                "subject": subject,

                "date": date,

                "snippet": msg.get("snippet", ""),

                "labels": labels,

                "is_unread": "UNREAD" in labels,

                "is_important": "IMPORTANT" in labels,

                "is_starred": "STARRED" in labels,

                "is_sent": "SENT" in labels,

                "is_inbox": "INBOX" in labels,

            })



        return emails



    except Exception as e:

        print(f"Email monitoring fetch failed: {e}")

        return []





def get_email_monitor_data():

    """

    Collect all information required by the Email Monitoring page.

    """



    label_stats = get_gmail_label_stats()



    # --------------------------------------------------------

    # Basic mailbox statistics

    # --------------------------------------------------------



    inbox_total = label_stats.get("INBOX", {}).get("total", 0)

    inbox_unread = label_stats.get("INBOX", {}).get("unread", 0)



    sent_total = label_stats.get("SENT", {}).get("total", 0)

    spam_total = label_stats.get("SPAM", {}).get("total", 0)

    trash_total = label_stats.get("TRASH", {}).get("total", 0)



    important_total = label_stats.get("IMPORTANT", {}).get("total", 0)

    starred_total = label_stats.get("STARRED", {}).get("total", 0)



    promotions_total = label_stats.get(

        "CATEGORY_PROMOTIONS", {}

    ).get("total", 0)



    social_total = label_stats.get(

        "CATEGORY_SOCIAL", {}

    ).get("total", 0)



    updates_total = label_stats.get(

        "CATEGORY_UPDATES", {}

    ).get("total", 0)



    forums_total = label_stats.get(

        "CATEGORY_FORUMS", {}

    ).get("total", 0)



    personal_total = label_stats.get(

        "CATEGORY_PERSONAL", {}

    ).get("total", 0)



    # --------------------------------------------------------

    # Customer/support email count

    # --------------------------------------------------------



    customer_queries = [

        '"order"',

        '"refund"',

        '"delivery"',

        '"shipping"',

        '"payment"',

        '"account"',

        '"product"',

        '"complaint"',

        '"support"',

        '"help"',

    ]



    customer_counts = []



    for query in customer_queries:

        count = search_gmail_count(query)

        customer_counts.append(count)



    customer_emails = max(customer_counts) if customer_counts else 0



    # --------------------------------------------------------

    # Recent emails

    # --------------------------------------------------------



    recent_emails = fetch_monitor_emails(max_results=50)



    # --------------------------------------------------------

    # Top senders

    # --------------------------------------------------------



    sender_counts = {}



    for email in recent_emails:



        sender = email.get("from", "").strip()



        if not sender:

            continue



        if "<" in sender and ">" in sender:

            sender_name = sender.split("<")[0].strip().strip('"')

            sender_email = (

                sender.split("<")[1]

                .split(">")[0]

                .strip()

            )



            display_sender = (

                sender_name

                if sender_name

                else sender_email

            )

        else:

            display_sender = sender



        sender_counts[display_sender] = (

            sender_counts.get(display_sender, 0) + 1

        )



    top_senders = sorted(

        [

            {

                "sender": sender,

                "count": count

            }

            for sender, count in sender_counts.items()

        ],

        key=lambda item: item["count"],

        reverse=True

    )[:10]



    # --------------------------------------------------------

    # Recent email activity

    # --------------------------------------------------------



    recent_activity = []



    for email in recent_emails[:15]:



        recent_activity.append({

            "id": email.get("id"),

            "subject": email.get("subject"),

            "from": email.get("from"),

            "date": email.get("date"),

            "snippet": email.get("snippet"),

            "is_unread": email.get("is_unread"),

            "is_important": email.get("is_important"),

            "is_starred": email.get("is_starred"),

        })



    # --------------------------------------------------------

    # Return dashboard data

    # --------------------------------------------------------



    return {

        "overview": {

            "inbox": inbox_total,

            "unread": inbox_unread,

            "sent": sent_total,

            "important": important_total,

            "starred": starred_total,

            "spam": spam_total,

            "trash": trash_total,

            "customer_emails": customer_emails,

        },



        "categories": {

            "promotions": promotions_total,

            "social": social_total,

            "updates": updates_total,

            "forums": forums_total,

            "personal": personal_total,

        },



        "top_senders": top_senders,



        "recent_emails": recent_activity,

    }









def search_gmail_emails(query="", max_results=50):

    service = get_gmail_service()



    response = service.users().messages().list(

        userId="me",

        q=query,

        maxResults=max_results

    ).execute()



    messages = response.get("messages", [])

    emails = []



    for message in messages:

        msg = service.users().messages().get(

            userId="me",

            id=message["id"],

            format="metadata",

            metadataHeaders=["From", "Subject", "Date"],

        ).execute()



        headers = msg.get("payload", {}).get("headers", [])



        def get_header(name):

            return next(

                (

                    h["value"]

                    for h in headers

                    if h["name"].lower() == name.lower()

                ),

                ""

            )



        labels = msg.get("labelIds", [])



        emails.append({

            "id": msg.get("id"),

            "thread_id": msg.get("threadId"),

            "from": get_header("From"),

            "subject": get_header("Subject") or "(No Subject)",

            "date": get_header("Date"),

            "snippet": msg.get("snippet", ""),

            "labels": labels,

            "is_unread": "UNREAD" in labels,

            "is_important": "IMPORTANT" in labels,

            "is_starred": "STARRED" in labels,

            "is_sent": "SENT" in labels,

            "is_inbox": "INBOX" in labels,

        })



    return {

        "emails": emails,

        "count": response.get("resultSizeEstimate", len(emails)),

        "next_page_token": response.get("nextPageToken"),

    }





def trash_gmail_messages(message_ids):

    service = get_gmail_service()



    results = []



    for message_id in message_ids:

        try:

            service.users().messages().trash(

                userId="me",

                id=message_id

            ).execute()



            results.append({

                "id": message_id,

                "success": True

            })



        except Exception as e:

            print(f"Failed to trash message {message_id}: {e}")



            results.append({

                "id": message_id,

                "success": False,

                "error": str(e)

            })



    return results




def trash_gmail_messages_before_date(query, before_date):
    """
    Move all Gmail messages matching the given query
    and received before the specified date to Trash.

    Example:
        query = "category:promotions"
        before_date = "2021-01-01"

    Gmail query becomes:
        category:promotions before:2021/01/01
    """

    service = get_gmail_service()

    # Convert HTML date input (YYYY-MM-DD)
    # into Gmail search format (YYYY/MM/DD)
    gmail_date = before_date.replace("-", "/")

    full_query = f"{query} before:{gmail_date}".strip()

    message_ids = []
    page_token = None

    # Fetch ALL matching Gmail messages.
    while True:
        response = (
            service.users()
            .messages()
            .list(
                userId="me",
                q=full_query,
                maxResults=500,
                pageToken=page_token,
            )
            .execute()
        )

        messages = response.get("messages", [])

        for message in messages:
            message_ids.append(message["id"])

        page_token = response.get("nextPageToken")

        if not page_token:
            break

    # Nothing matched.
    if not message_ids:
        return {
            "query": full_query,
            "matched": 0,
            "deleted": 0,
            "results": [],
        }

    # Move every matching message to Trash.
    results = trash_gmail_messages(message_ids)

    successful = sum(
        1
        for result in results
        if result.get("success")
    )

    return {
        "query": full_query,
        "matched": len(message_ids),
        "deleted": successful,
        "results": results,
    }
    
    
def get_gmail_email(message_id):
    service = get_gmail_service()

    msg = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()

    headers = msg.get("payload", {}).get("headers", [])

    def get_header(name):
        return next(
            (
                h["value"]
                for h in headers
                if h["name"].lower() == name.lower()
            ),
            ""
        )

    def extract_body_parts(payload):
        if not payload:
            return {
                "text": "",
                "html": ""
            }

        mime_type = payload.get("mimeType", "")
        body_data = payload.get("body", {}).get("data")

        result = {
            "text": "",
            "html": ""
        }

        if body_data:
            import base64

            try:
                decoded = base64.urlsafe_b64decode(
                    body_data + "=" * (-len(body_data) % 4)
                ).decode("utf-8", errors="ignore")

                if mime_type == "text/html":
                    result["html"] = decoded

                elif mime_type == "text/plain":
                    result["text"] = decoded

            except Exception:
                pass

        for part in payload.get("parts", []):
            child = extract_body_parts(part)

            if child["text"] and not result["text"]:
                result["text"] = child["text"]

            if child["html"] and not result["html"]:
                result["html"] = child["html"]

        return result

    labels = msg.get("labelIds", [])

    body_parts = extract_body_parts(
        msg.get("payload", {})
    )

    return {
        "id": msg.get("id"),
        "thread_id": msg.get("threadId"),
        "from": get_header("From"),
        "to": get_header("To"),
        "subject": get_header("Subject") or "(No Subject)",
        "date": get_header("Date"),
        "snippet": msg.get("snippet", ""),

        # Plain-text version
        "body": body_parts["text"],

        # Original HTML version
        "html_body": body_parts["html"],

        "labels": labels,
        "is_unread": "UNREAD" in labels,
        "is_important": "IMPORTANT" in labels,
        "is_starred": "STARRED" in labels,
        "is_sent": "SENT" in labels,
        "is_inbox": "INBOX" in labels,
    }

def mark_gmail_messages_read(message_ids):

    service = get_gmail_service()



    results = []



    for message_id in message_ids:

        try:

            service.users().messages().modify(

                userId="me",

                id=message_id,

                body={

                    "removeLabelIds": ["UNREAD"]

                }

            ).execute()



            results.append({

                "id": message_id,

                "success": True

            })



        except Exception as e:

            print(f"Failed to mark message as read {message_id}: {e}")



            results.append({

                "id": message_id,

                "success": False,

                "error": str(e)

            })



    return results





def mark_gmail_messages_unread(message_ids):

    service = get_gmail_service()



    results = []



    for message_id in message_ids:

        try:

            service.users().messages().modify(

                userId="me",

                id=message_id,

                body={

                    "addLabelIds": ["UNREAD"]

                }

            ).execute()



            results.append({

                "id": message_id,

                "success": True

            })



        except Exception as e:

            print(

                f"Failed to mark message as unread {message_id}: {e}"

            )



            results.append({

                "id": message_id,

                "success": False,

                "error": str(e)

            })



    return results