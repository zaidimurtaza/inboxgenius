from google import genai
import json 
import re
import ast
client = genai.Client(api_key="AIzaSyAG6t7VCOmUgVREpRj6WnjWDvv2-WG5MsQ")

prompt = """
You are given a list of emails in this format:
{{
  "emails": [
    {{"msg_id": "abc123", "subject": "Meeting Reminder", "sender": "boss@example.com", "receiver": "me@example.com", "date": "2024-06-14", "body": "..."}},
    {{"msg_id": "def456", "subject": "50% OFF - Limited Time Offer!", "sender": "promo@example.com", "receiver": "me@example.com", "date": "2024-06-13", "body": "..."}},
    ...
  ]
}}

Here is the data:
{emails}

Your task is to go through this list and decide which `msg_id`s should be deleted. Also identify emails that may be important (e.g., from work, bank, bills, or personal contacts).

Output the result in this format:
```
    {{
        to_delete: [list of msg_ids]
        important: [list of msg_ids]
    }}
```

Be strict about spam or promotional emails, and keep emails that seem important, official, or related to communication with known contacts.
"""
class Email_LLM:
    
    def make_prompt(self, emails):
        main_prompt = prompt.format(emails=emails)
        return main_prompt


    def analyze_llm(self, prompt):
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )
        return response.text


    def get_analyzed_list(self ,emails):
        self.emails = emails
        prompt = self.make_prompt(emails=emails)
        llm_response = self.analyze_llm(prompt)

        # Step 1: Strip markdown formatting
        llm_response = llm_response.strip()
        if llm_response.startswith("```json"):
            llm_response = llm_response.replace("```json", "").strip()
        if llm_response.startswith("```"):
            llm_response = llm_response.replace("```", "", 1).strip()
        if llm_response.endswith("```"):
            llm_response = llm_response[:-3].strip()

        # Step 2: Try to parse as JSON
        try:
            parsed = json.loads(llm_response)
            return parsed
        except json.JSONDecodeError:
            print("⚠️ JSON parse failed. Trying fallback...")
            # Return empty result if parsing fails
            return {"to_delete": [], "important": []}

    def get_emails(self, email_ids):
        email_list = self.emails.get("emails", [])  # safely get the list
        return [email for email in email_list if email["msg_id"] in email_ids]




    
# emails_data = {"emails": [{"msg_id": "001", "subject": "Hi", "sender": "friend@mail.com"}]}
# print(make_prompt(emails=emails_data))