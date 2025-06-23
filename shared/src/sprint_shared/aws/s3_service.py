import boto3
import json
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

load_dotenv()


class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')

    def store_ticket(self, ticket_id: str, ticket_data: Dict[str, Any], service_type: str) -> bool:
        try:
            ticket_json = json.dumps(ticket_data)

            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=f'{service_type}/tickets/{ticket_id}.json',
                Body=ticket_json,
                ContentType='application/json'
            )
            return True
        except ClientError as e:
            print(f"Error storing ticket in S3: {e}")
            return False

    def get_ticket(self, ticket_id: str, service_type: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=f'{service_type}/tickets/{ticket_id}.json'
            )
            ticket_data = json.loads(response['Body'].read().decode('utf-8'))
            return ticket_data
        except ClientError as e:
            print(f"Error retrieving ticket from S3: {e}")
            return None

    def list_tickets(self, service_type: str) -> list:
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f'{service_type}/tickets/'
            )

            tickets = []
            for obj in response.get('Contents', []):
                ticket_id = obj['Key'].split('/')[-1].replace('.json', '')
                ticket_data = self.get_ticket(ticket_id, service_type)
                if ticket_data:
                    tickets.append(ticket_data)

            return tickets
        except ClientError as e:
            print(f"Error listing tickets from S3: {e}")
            return []

    def delete_ticket(self, ticket_id: str, service_type: str) -> bool:
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=f'{service_type}/tickets/{ticket_id}.json'
            )
            return True
        except ClientError as e:
            print(f"Error deleting ticket from S3: {e}")
            return False
