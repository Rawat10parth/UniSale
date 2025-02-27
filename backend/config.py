import os

# Local MySQL (XAMPP)
LOCAL_DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Change if you have set a password
    "database": "unisale"
}

# Google Cloud SQL (Commented for now)
# CLOUD_DB_CONFIG = {
#     "host": "/cloudsql/YOUR_PROJECT_ID:YOUR_INSTANCE_NAME",
#     "user": "YOUR_DB_USER",
#     "password": "YOUR_DB_PASSWORD",
#     "database": "unisale"
# }

# Switch between LOCAL_DB_CONFIG and CLOUD_DB_CONFIG when needed
DB_CONFIG = LOCAL_DB_CONFIG
