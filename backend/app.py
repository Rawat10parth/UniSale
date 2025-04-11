import os
import json
import requests
import mysql.connector
from flask import Flask, request, redirect, session, jsonify, url_for, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import storage
import uuid, tempfile
from werkzeug.utils import secure_filename
import traceback

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Secret key for session management
app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecretkey")

# Microsoft OAuth Config
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = os.getenv("TENANT_ID")
CLOUD_INSTANCE = os.getenv("CLOUD_INSTANCE", "https://login.microsoftonline.com/")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# Microsoft Authority URLs
AUTHORITY = f"{CLOUD_INSTANCE}{TENANT_ID}/v2.0"
TOKEN_URL = f"{AUTHORITY}/token"
AUTH_URL = f"{AUTHORITY}/authorize"

# Microsoft Graph API Endpoint
GRAPH_API_ENDPOINT = os.getenv("GRAPH_API_ENDPOINT", "https://graph.microsoft.com/")

# Allowed university domain
ALLOWED_DOMAIN = "stu.upes.ac.in"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "tactile-rigging-451008-a0-f0a39bd91c95.json"

# =================== MYSQL CONNECTION SETUP =================== #

# Local MySQL (XAMPP) Configuration
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DATABASE = "unisale"


# Establish database connection
def get_db_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        pool_name="unisale_pool",
    )


# =================== FIREBASE AUTH SETUP =================== #

cred = credentials.Certificate("firebase-adminsdk.json")  # Update path
firebase_admin.initialize_app(cred)


# Utility function to get Firebase UID from token
def get_current_user_id():
    id_token = request.headers.get('Authorization')
    if not id_token:
        return None

    try:
        decoded_token = auth.verify_id_token(id_token.split(' ')[1])
        user_email = decoded_token['email']

        # Fetch user_id from DB using email
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
        user = cursor.fetchone()
        return user['id'] if user else None
    except:
        return None


# Get product by ID
def get_product_by_id(product_id):
    cursor = mysql.connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM product WHERE id = %s", (product_id,))
    return cursor.fetchone()


# Delete product by ID
def delete_product_by_id(product_id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM product WHERE id = %s", (product_id,))
    mysql.connection.commit()


# =================== ROUTES =================== #

@app.route("/")
def home():
    return jsonify({"message": "Welcome to UniSale API!"})


@app.route("/users", methods=["GET"])
def get_users():
    """Fetch all users from the database (test route)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, verified FROM users")
        users = cursor.fetchall()
        conn.close()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    name = data.get("name")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"success": False, "message": "User already exists!"})

        # Insert new user
        cursor.execute("INSERT INTO users (name, email, verified) VALUES (%s, %s, 1)", (name, email))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Signup successful!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# =================== Google Cloud Storage Setup =================== #

BUCKET_NAME = "unisale-storage"


def gcs_upload_image(file, folder):
    """Uploads an image to Google Cloud Storage under the specified folder and returns the public URL."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)

        # Generate a unique filename inside the folder
        unique_filename = f"{folder}/{uuid.uuid4()}_{secure_filename(file.filename)}"
        blob = bucket.blob(unique_filename)

        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        # Upload the file to GCS
        blob.upload_from_filename(temp_file_path)
        blob.make_public()
        public_url = blob.public_url
        print(f"Image uploaded to {public_url}")

        # Remove the temporary file
        os.unlink(temp_file_path)

        return public_url
    except Exception as e:
        print(f"Error uploading file to GCS: {str(e)}")
        # Ensure temporary file is removed even if an error occurs
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except Exception as del_error:
                print(f"Error deleting temporary file: {str(del_error)}")
        return None


db = mysql.connector.connect(
    host="localhost", user="root", password="", database="unisale"
)
cursor = db.cursor()


@app.route("/api/upload", methods=["POST"])
def upload_product():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image_url = gcs_upload_image(file, "product-image")  # Upload to 'product-image' folder

    if not image_url:
        return jsonify({"error": "Image upload failed"}), 500

    # Get product details from form data
    user_id = request.form.get("user_id")
    name = request.form.get("name")
    description = request.form.get("description")
    category = request.form.get("category")
    state = request.form.get("state")
    price = request.form.get("price")

    if not all([user_id, name, description, category, state, price, image_url]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO products (user_id, name, description, category, state, price, image_url) VALUES (%s, %s, %s, "
            "%s,"
            "%s, %s, %s)",
            (user_id, name, description, category, state, price, image_url),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product uploaded successfully", "image_url": image_url}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/update-profile-picture", methods=["POST"])
def update_profile_picture():
    user_id = request.form.get("user_id")
    if "image" not in request.files or not user_id:
        return jsonify({"error": "Missing image or user_id"}), 400

    file = request.files["image"]
    image_url = gcs_upload_image(file, "profile-picture")  # Upload to 'profile-picture' folder
    if not image_url:
        return jsonify({"error": "Image upload failed"}), 500

    try:
        cursor.execute("UPDATE users SET profile_picture = %s WHERE id = %s", (image_url, user_id))
        db.commit()
        return jsonify({"message": "Profile picture updated", "image_url": image_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Fetch User Profile API
@app.route('/get-profile', methods=['POST', 'GET'])
def get_profile():
    email = None

    if request.method == 'GET':
        email = request.args.get('email')
    else:
        data = request.json
        email = data.get('email') if data else None

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, profile_picture, phone FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({
                "id": user["id"],
                "name": user["name"],
                "profilePic": user["profile_picture"] or "https://via.placeholder.com/150",
                "phoneNumber": user["phone"] or ""
            })
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        print("Error in get-profile route:")
        print(traceback.format_exc())  # Logs full error stack trace
        return jsonify({"error": str(e)}), 500


@app.route("/update-name", methods=["POST"])
def update_name():
    data = request.json
    user_id = data.get("user_id")
    name = data.get("name")

    if not user_id or not name:
        return jsonify({"error": "Missing user_id or name"}), 400

    try:
        cursor.execute("UPDATE users SET name = %s WHERE id = %s", (name, user_id))
        db.commit()
        return jsonify({"message": "Name updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/update-phone-number", methods=["POST"])
def update_phone_number():
    data = request.json
    user_id = data.get("user_id")
    phone_number = data.get("phone_number")

    # Validate phone number: must be 10 digits
    if not user_id or not phone_number or not phone_number.isdigit() or len(phone_number) != 10:
        return jsonify({"error": "Invalid phone number. Must be exactly 10 digits."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET phone = %s WHERE id = %s", (phone_number, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Phone number updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get-products", methods=["GET"])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Include id so that products in the frontend have an identifier.
        cursor.execute("SELECT id, user_id, name, description, category, state, price, image_url FROM products")
        products = cursor.fetchall()
        conn.close()
        return jsonify(products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    # You can add authorization checks here if needed,
    # for example, ensuring the current user is the owner of the product.
    data = request.json
    # Make sure to get the necessary fields from the request.
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")
    state = data.get("state")
    price = data.get("price")

    # Validate that all required fields are provided.
    if not all([name, description, category, state, price]):
        return jsonify({"error": "All fields are required to update the product"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        update_query = """
            UPDATE products
            SET name = %s, description = %s, category = %s, state = %s, price = %s
            WHERE id = %s
        """
        cursor.execute(update_query, (name, description, category, state, price, product_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/userid')
def get_user_id():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify({'user_id': user_id})


@app.route('/toggle-wishlist', methods=['POST'])
def toggle_wishlist():
    data = request.json
    user_id = data.get("users_id")
    image_url = data.get("image_url")

    if not user_id or not image_url:
        return jsonify({"error": "Missing fields"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if item exists
        cursor.execute(
            "SELECT * FROM wishlist WHERE users_id = %s AND image_url = %s",
            (user_id, image_url)
        )
        existing = cursor.fetchone()

        if existing:
            # If it exists, remove it (toggle off)
            cursor.execute(
                "DELETE FROM wishlist WHERE users_id = %s AND image_url = %s",
                (user_id, image_url)
            )
            conn.commit()
            result = {"message": "Removed from wishlist", "status": "removed"}
        else:
            # Otherwise, add it (toggle on)
            cursor.execute(
                "INSERT INTO wishlist (users_id, image_url) VALUES (%s, %s)",
                (user_id, image_url)
            )
            conn.commit()
            result = {"message": "Added to wishlist", "status": "added"}

        cursor.close()
        conn.close()
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get-wishlist', methods=['GET'])
def get_wishlist():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # First, get the wishlist items (the image URLs) for the given user_id.
        cursor.execute(
            "SELECT image_url FROM wishlist WHERE users_id = %s",
            (user_id,)
        )
        wishlist_items = cursor.fetchall()

        # If the wishlist is empty, clean up and return an empty list.
        if not wishlist_items:
            cursor.close()
            conn.close()
            return jsonify([])

        # Extract image URLs from the wishlist items.
        image_urls = [item[0] for item in wishlist_items]

        # Build placeholders for the SQL query.
        placeholders = ', '.join(['%s'] * len(image_urls))

        # Get full product details for these image URLs.
        cursor.execute(
            f"""
            SELECT p.id, p.name, p.description, p.price, p.state, p.category, p.image_url, p.user_id 
            FROM products p 
            WHERE p.image_url IN ({placeholders})
            """,
            tuple(image_urls)
        )

        products = cursor.fetchall()

        # Format the query results as a list of dictionaries.
        result = []
        for product in products:
            result.append({
                "id": product[0],
                "name": product[1],
                "description": product[2],
                "price": product[3],
                "state": product[4],
                "category": product[5],
                "image_url": product[6],
                "user_id": product[7]
            })

        cursor.close()
        conn.close()
        return jsonify(result)

    except Exception as e:
        print(f"Error fetching wishlist: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/product/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get product details
        cursor.execute("""
            SELECT id, user_id, name, description, category, state, price, image_url, created_at 
            FROM products 
            WHERE id = %s
        """, (product_id,))
        product = cursor.fetchone()

        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Get seller details
        cursor.execute("""
            SELECT id, name, email, profile_picture as profilePic, phone as phoneNumber
            FROM users
            WHERE id = %s
        """, (product.get('user_id'),))
        seller = cursor.fetchone()

        conn.close()

        # Format dates for better readability
        if product and 'created_at' in product and product['created_at']:
            product['created_at'] = product['created_at'].isoformat()

        return jsonify({
            "product": product,
            "seller": seller
        })

    except Exception as e:
        print("Error fetching product details:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/user/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    """Fetch user information by ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, email, phone, profile_picture FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Don't expose sensitive information
        return jsonify({
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "profilePic": user["profile_picture"]
        })
    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

# curl -X POST -F "image=@Zoro-Wallpaper-4k.jpg" http://127.0.0.1:5000/upload-image
