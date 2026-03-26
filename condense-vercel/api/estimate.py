from http.server import BaseHTTPRequestHandler
import json, sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from AWS.aws import estimate_msk_provisioned, estimate_msk_express, estimate_msk_serverless
from schema import EstimateRequestProvisioned, EstimateRequestExpress, EstimateRequestServerless

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        try:
            cluster_type = body.get("cluster_type")
            if cluster_type == "provisioned":
                result = estimate_msk_provisioned(EstimateRequestProvisioned(**body))
            elif cluster_type == "express":
                result = estimate_msk_express(EstimateRequestExpress(**body))
            elif cluster_type == "serverless":
                result = estimate_msk_serverless(EstimateRequestServerless(**body))
            else:
                raise ValueError("Invalid cluster_type")
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result.dict()).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
