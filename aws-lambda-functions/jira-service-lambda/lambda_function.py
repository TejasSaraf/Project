import json
import os
import boto3
import requests
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

JIRA_SERVICE_URL = os.environ.get('JIRA_SERVICE_URL', 'http://localhost:8000')
JIRA_SERVICE_API_KEY = os.environ.get('JIRA_SERVICE_API_KEY')

s3_client = boto3.client('s3')


class JiraServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def validate_request(event: Dict[str, Any]) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body', '{}'))
        required_fields = ['prompt']

        for field in required_fields:
            if field not in body:
                raise JiraServiceError(f"Missing required field: {field}", 400)

        return body
    except json.JSONDecodeError:
        raise JiraServiceError("Invalid JSON in request body", 400)


def call_jira_service(request_data: Dict[str, Any]) -> Dict[str, Any]:
    if not JIRA_SERVICE_API_KEY:
        raise JiraServiceError("RAG service API key not configured", 500)

    try:
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': JIRA_SERVICE_API_KEY
        }

        logger.info(
            f"Calling RAG service at: {JIRA_SERVICE_URL}/generate-ticket")

        response = requests.post(
            f"{JIRA_SERVICE_URL}/generate-ticket",
            headers=headers,
            json=request_data,
            timeout=30
        )

        if not response.ok:
            error_data = response.json() if response.content else {}
            error_message = error_data.get(
                'detail', 'Failed to generate ticket')
            logger.error(
                f"RAG service error: {response.status_code} - {error_message}")
            raise JiraServiceError(error_message, response.status_code)

        return response.json()

    except requests.exceptions.RequestException as e:
        logger.error(f"Request to RAG service failed: {str(e)}")
        raise JiraServiceError(
            f"Failed to communicate with RAG service: {str(e)}")


def store_ticket_in_s3(ticket_data: Dict[str, Any], ticket_id: str) -> None:
    try:
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        if not bucket_name:
            logger.warning(
                "S3_BUCKET_NAME not configured, skipping S3 storage")
            return

        s3_key = f"jira-tickets/{ticket_id}.json"

        ticket_data['created_at'] = datetime.utcnow().isoformat()
        ticket_data['service_type'] = 'jira'

        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=json.dumps(ticket_data, indent=2),
            ContentType='application/json'
        )

        logger.info(f"Ticket stored in S3: {bucket_name}/{s3_key}")

    except Exception as e:
        logger.error(f"Failed to store ticket in S3: {str(e)}")


def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        'body': json.dumps(body)
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        logger.info(f"Received event: {json.dumps(event)}")

        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {'message': 'OK'})

        request_data = validate_request(event)

        ticket_data = call_jira_service(request_data)

        if 'ticket_id' in ticket_data:
            store_ticket_in_s3(ticket_data, ticket_data['ticket_id'])

        logger.info(
            f"Successfully generated ticket: {ticket_data.get('ticket_id', 'unknown')}")

        return create_response(200, ticket_data)

    except JiraServiceError as e:
        logger.error(f"Jira service error: {e.message}")
        return create_response(e.status_code, {'error': e.message})

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
