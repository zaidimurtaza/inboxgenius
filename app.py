from flask import Flask, redirect, url_for, session, request, jsonify
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import pathlib
import json
import google.auth.transport.requests
import google.oauth2.credentials
import base64
from llm import Email_LLM
from datetime import datetime, timedelta
import re
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'murtaza123'  # replace with a secure random string
CORS(app, supports_credentials=True)

# Gmail full access scope
SCOPES = ['https://mail.google.com/']
CLIENT_SECRETS_FILE = 'credentials.json'

# Set up redirect URI
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # for testing only
REDIRECT_URI = 'http://localhost:8000/oauth2callback'

def parse_date(date_string):
    """Parse email date string and return a formatted date"""
    try:
        # Remove timezone info and parse
        date_string = re.sub(r'\([^)]*\)', '', date_string).strip()
        date_obj = datetime.strptime(date_string, '%a, %d %b %Y %H:%M:%S %z')
        return date_obj.strftime('%B %d, %Y at %I:%M %p')
    except:
        return date_string

def build_gmail_query(date_range=None, start_date=None, end_date=None):
    """Build Gmail API query based on date parameters"""
    query_parts = []
    
    if date_range:
        # Handle predefined date ranges
        if date_range == 'last_7_days':
            query_parts.append('after:7d')
        elif date_range == 'last_30_days':
            query_parts.append('after:30d')
        elif date_range == 'last_90_days':
            query_parts.append('after:90d')
        elif date_range == 'last_year':
            query_parts.append('after:1y')
    
    if start_date and end_date:
        # Handle custom date range
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            query_parts.append(f'after:{start_dt.strftime("%Y/%m/%d")}')
            query_parts.append(f'before:{end_dt.strftime("%Y/%m/%d")}')
        except ValueError:
            pass
    
    return ' '.join(query_parts) if query_parts else None

@app.route('/')
def index():
    return '<a href="/authorize">Login with Gmail</a>'

@app.route('/check-auth')
def check_auth():
    """Check if user is authenticated"""
    if 'credentials' in session:
        return jsonify({'authenticated': True}), 200
    return jsonify({'authenticated': False}), 401

@app.route('/logout')
def logout():
    """Clear session and logout user"""
    session.clear()
    return redirect('http://localhost:5173')

@app.route('/api/emails')
def api_emails():
    """API endpoint to get emails in JSON format"""
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    llm_class = Email_LLM()
    creds_data = session['credentials']
    creds = google.oauth2.credentials.Credentials(**creds_data)
    service = build('gmail', 'v1', credentials=creds)

    try:
        results = service.users().messages().list(userId='me', maxResults=10).execute()
        messages = results.get('messages', [])
    except Exception as e:
        return jsonify({'error': f'Error fetching messages: {e}'}), 500

    emails = {"emails": []}
    all_emails = []

    for msg in messages:
        try:
            msg_id = msg['id']
            msg_detail = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
            headers = msg_detail.get('payload', {}).get('headers', [])

            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), '(Unknown Sender)')
            receiver = next((h['value'] for h in headers if h['name'] == 'To'), '(Unknown Recipient)')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '(No Date)')

            body = ''
            payload = msg_detail.get('payload', {})
            if 'parts' in payload:
                for part in payload['parts']:
                    if part.get('mimeType') == 'text/plain':
                        data = part['body'].get('data')
                        if data:
                            body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                            break
            else:
                data = payload.get('body', {}).get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')

            email_data = {
                "msg_id": msg_id,
                "subject": subject,
                "sender": sender,
                "receiver": receiver,
                "date": parse_date(date),
                "body": body
            }
            
            emails["emails"].append(email_data)
            all_emails.append(email_data)

        except Exception as inner_e:
            print(f"Error processing email: {inner_e}")

    # Analyze emails with LLM
    try:
        analyzed_list = llm_class.get_analyzed_list(emails=emails)
        to_delete_emails = llm_class.get_emails(analyzed_list.get("to_delete", []))
        important_emails = llm_class.get_emails(analyzed_list.get("important", []))
    except Exception as e:
        print(f"LLM analysis error: {e}")
        to_delete_emails = []
        important_emails = []

    return jsonify({
        'total_emails': len(all_emails),
        'to_delete_count': len(to_delete_emails),
        'important_count': len(important_emails),
        'all_emails': all_emails,
        'to_delete_emails': to_delete_emails,
        'important_emails': important_emails
    })

@app.route('/api/emails/<msg_id>/delete', methods=['DELETE'])
def delete_email(msg_id):
    """Delete an email by message ID"""
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        creds_data = session['credentials']
        creds = google.oauth2.credentials.Credentials(**creds_data)
        service = build('gmail', 'v1', credentials=creds)
        
        # Delete the email using Gmail API
        service.users().messages().delete(userId='me', id=msg_id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Email deleted successfully',
            'msg_id': msg_id
        }), 200
        
    except Exception as e:
        print(f"Error deleting email {msg_id}: {e}")
        return jsonify({
            'success': False,
            'error': f'Failed to delete email: {str(e)}'
        }), 500

@app.route('/authorize')
def authorize():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    state = session['state']
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        state=state,
        redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    return redirect('http://localhost:5173')

@app.route('/gmail/<num>')
def gmail(num):
    if 'credentials' not in session:
        return redirect(url_for('authorize'))
    llm_class = Email_LLM()
    creds_data = session['credentials']
    creds = google.oauth2.credentials.Credentials(**creds_data)
    service = build('gmail', 'v1', credentials=creds)

    try:
        results = service.users().messages().list(userId='me', maxResults=num).execute()
        messages = results.get('messages', [])
    except Exception as e:
        return f"<p>Error fetching messages: {e}</p>"

    output = "<h2>Last 5 Emails</h2><ul>"
    emails = {"emails":[]}

    for msg in messages:
        try:
            msg_id = msg['id']
            msg_detail = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
            headers = msg_detail.get('payload', {}).get('headers', [])

            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), '(Unknown Sender)')
            receiver = next((h['value'] for h in headers if h['name'] == 'To'), '(Unknown Recipient)')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '(No Date)')


            sender_type = 'No-Reply' if 'no-reply' in sender.lower() or 'noreply' in sender.lower() else 'Regular Sender'

            body = ''
            payload = msg_detail.get('payload', {})
            if 'parts' in payload:
                for part in payload['parts']:
                    if part.get('mimeType') == 'text/plain':
                        data = part['body'].get('data')
                        if data:
                            body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                            break
            else:
                data = payload.get('body', {}).get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            emails["emails"].append({"msg_id":msg_id, "subject": subject, "sender":sender, "receiver":receiver, "date":date, "body": body})

            # output += f"""
            # <li>
            #     <strong>Subject:</strong> {subject}<br>
            #     <strong>From:</strong> {sender} ({sender_type})<br>
            #     <strong>To:</strong> {receiver}<br>
            #     <strong>Date:</strong> {date}<br>
            #     <details>
            #         <summary><strong>Body (click to expand)</strong></summary>
            #         <pre>{body}</pre>
            #     </details>
            #     <hr>
            # </li>
            # """
        except Exception as inner_e:
            output += f"<li><em>Error processing email: {inner_e}</em></li>"

    analyzed_list = llm_class.get_analyzed_list(emails=emails)
    to_delete = llm_class.get_emails(analyzed_list.get("to_delete", []))
    output +="            <h2>SUGGESTED DELETE</h2>          "
    for msg in to_delete:
        output += f"""
            <br></br>

                <li>
                    <strong>Subject:</strong> {msg.get("subject")}<br>
                    <strong>From:</strong> {msg.get("sender")} ()<br>
                    <strong>To:</strong> {msg.get("receiver")}<br>
                    <strong>Date:</strong> {msg.get("date")}<br>
                    <details>
                        <summary><strong>Body (click to expand)</strong></summary>
                        <pre>{msg.get("body")}</pre>
                    </details>
                    <hr>
                </li>
                """
    important = llm_class.get_emails(analyzed_list.get("important", []))
    output +="            <h2>IMPORTANT</h2>   "
    for msg in important:
        output += f"""
            <br></br>

                <li>
                    <strong>Subject:</strong> {msg.get("subject")}<br>
                    <strong>From:</strong> {msg.get("sender")} ()<br>
                    <strong>To:</strong> {msg.get("receiver")}<br>
                    <strong>Date:</strong> {msg.get("date")}<br>
                    <details>
                        <summary><strong>Body (click to expand)</strong></summary>
                        <pre>{msg.get("body")}</pre>
                    </details>
                    <hr>
                </li>
                """

    # output += f"<li>{analyzed_list} </li> <li>{to_delete} </li> </ul>"
    return output

@app.route('/api/emails/fetch', methods=['POST'])
def fetch_emails():
    """Fetch emails with date range and count options"""
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        count = data.get('count', 10)
        date_range = data.get('date_range')  # 'last_7_days', 'last_30_days', etc.
        start_date = data.get('start_date')  # 'YYYY-MM-DD'
        end_date = data.get('end_date')      # 'YYYY-MM-DD'
        
        creds_data = session['credentials']
        creds = google.oauth2.credentials.Credentials(**creds_data)
        service = build('gmail', 'v1', credentials=creds)

        # Build query - if no date filters provided, fetch latest emails
        query = build_gmail_query(date_range, start_date, end_date)
        
        # Fetch messages - if no query, it will fetch the latest emails
        if query:
            results = service.users().messages().list(
                userId='me', 
                maxResults=count,
                q=query
            ).execute()
        else:
            # No date filter - fetch latest emails
            results = service.users().messages().list(
                userId='me', 
                maxResults=count
            ).execute()
        
        messages = results.get('messages', [])
        
        if not messages:
            return jsonify({
                'emails': [],
                'total_fetched': 0,
                'message': 'No emails found for the specified criteria'
            })

        emails = []
        for msg in messages:
            try:
                msg_id = msg['id']
                msg_detail = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
                headers = msg_detail.get('payload', {}).get('headers', [])

                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
                sender = next((h['value'] for h in headers if h['name'] == 'From'), '(Unknown Sender)')
                receiver = next((h['value'] for h in headers if h['name'] == 'To'), '(Unknown Recipient)')
                date = next((h['value'] for h in headers if h['name'] == 'Date'), '(No Date)')

                body = ''
                payload = msg_detail.get('payload', {})
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part.get('mimeType') == 'text/plain':
                            data = part['body'].get('data')
                            if data:
                                body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                                break
                else:
                    data = payload.get('body', {}).get('data')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')

                email_data = {
                    "msg_id": msg_id,
                    "subject": subject,
                    "sender": sender,
                    "receiver": receiver,
                    "date": parse_date(date),
                    "body": body
                }
                
                emails.append(email_data)

            except Exception as inner_e:
                print(f"Error processing email: {inner_e}")
                continue

        return jsonify({
            'emails': emails,
            'total_fetched': len(emails),
            'query_used': query,
            'date_range': date_range,
            'start_date': start_date,
            'end_date': end_date,
            'message': f'Successfully fetched {len(emails)} latest emails' if not query else f'Successfully fetched {len(emails)} emails with date filter'
        })

    except Exception as e:
        print(f"Error fetching emails: {e}")
        return jsonify({'error': f'Failed to fetch emails: {str(e)}'}), 500

@app.route('/api/emails/analyze', methods=['POST'])
def analyze_emails():
    """Analyze emails in batches of 10 using AI"""
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        emails = data.get('emails', [])
        batch_size = 10
        
        if not emails:
            return jsonify({'error': 'No emails provided for analysis'}), 400
        
        llm_class = Email_LLM()
        all_to_delete = []
        all_important = []
        
        # Process emails in batches
        for i in range(0, len(emails), batch_size):
            batch = emails[i:i + batch_size]
            batch_data = {"emails": batch}
            
            try:
                # Analyze batch
                analyzed_list = llm_class.get_analyzed_list(emails=batch_data)
                
                # Get email details for the analyzed IDs
                to_delete_emails = llm_class.get_emails(analyzed_list.get("to_delete", []))
                important_emails = llm_class.get_emails(analyzed_list.get("important", []))
                
                all_to_delete.extend(to_delete_emails)
                all_important.extend(important_emails)
                
                print(f"Processed batch {i//batch_size + 1}: {len(batch)} emails")
                
            except Exception as batch_error:
                print(f"Error processing batch {i//batch_size + 1}: {batch_error}")
                continue
        
        return jsonify({
            'to_delete_emails': all_to_delete,
            'important_emails': all_important,
            'to_delete_count': len(all_to_delete),
            'important_count': len(all_important),
            'total_analyzed': len(emails),
            'batches_processed': (len(emails) + batch_size - 1) // batch_size
        })

    except Exception as e:
        print(f"Error analyzing emails: {e}")
        return jsonify({'error': f'Failed to analyze emails: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
