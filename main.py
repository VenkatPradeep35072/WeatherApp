from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import bcrypt
import jwt
from jwt import encode
from datetime import datetime, timedelta
import secrets

app = FastAPI()


# Allow CORS for development purposes
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with the domains you want to allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
conn = psycopg2.connect(
    host="localhost",
    database="weatherapp",
    user="postgres",
    password="Tvans@527"
)

# User model


class User(BaseModel):
    email: str
    password: str
    name: str
    city: str
    city2: str
    city3: str
# LoginUser model


class LoginUser(BaseModel):
    email: str
    password: str


# Get JWT token from header
JWT_SECRET = secrets.token_hex(32)


async def get_token(authorization: str = Header(...)):
    if not authorization:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials")
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials")
    return token

# Verify JWT token and get current user


async def get_current_user(token: str = Depends(get_token)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Sign up new user


@app.post("/signup")
def signup(user: User):
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute("SELECT email FROM users WHERE email=%s", (user.email,))
    existing_user = cursor.fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

    # Insert user into database
    cursor.execute(
        "INSERT INTO users (email, password, name,city1,city2,city3) VALUES (%s, %s, %s,%s, %s, %s)",
        (user.email, hashed_password.decode(),
         user.name, user.city, user.city2, user.city3)
    )
    conn.commit()

    return {"message": "User created successfully"}

# Log in existing user and generate JWT token


@app.post("/login")
def login(user: LoginUser):
    cursor = conn.cursor()

    # Retrieve user from database
    cursor.execute(
        "SELECT email, password, name FROM users WHERE email=%s", (user.email,))
    db_user = cursor.fetchone()

    if db_user is None:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")

    # Verify password
    if bcrypt.checkpw(user.password.encode(), db_user[1].encode()):
        # Generate JWT token
        token = jwt.encode({
            "sub": db_user[0],
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1),
        }, JWT_SECRET, algorithm="HS256")

        # Decode JWT token to get user email
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials")

        # Retrieve user details from database
        cursor.execute(
            "SELECT email, name,city1,city2,city3 FROM users WHERE email=%s", (email,))
        current_user = cursor.fetchone()

        return {"access_token": current_user}
    else:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")


@app.post("/protected")
def protected(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello {current_user}"}
