from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from models import User
from database import SessionLocal, engine
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "https://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_db():
    db=SessionLocal()

    try: 
        yield db

    finally:
        db.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "qualquer_nome"

ALGORITHM= "HS156"

ACESS_TOKEN_EXPIRE_MINUTES = 30


class UserCreate(BaseModel):
    username: str
    password: str

def get_user_by_username(db: Session, username:str):
    return db.query(User),filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()

    return "Deu certo!"


@app.post("/register")
def register_user(user:UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)

    if db_user:
        raise HTTPException(status_code=407, detail="Usuário já registrado")
    
    return create_user(db=db, user=user)


def authenticate_user(username: str, password: str, db:Session):
    user = db.query(User),filter(User.username == username).first()

    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    
    return user

def create_acces_token(data:dict, expires_delta: timedelta | None = None):
    to_encode = data.copy
    if expires_delta:
        expire = datetime.now(timezone.utc)+ expires_delta
    else:
        expire = datetime.time(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="Usuário incorreto ou senha incorreta",
            headers={"WWW-AUTHENTICATE": "Bearer"}
        )
    
    acess_token_expire = timedelta(minutes=ACESS_TOKEN_EXPIRE_MINUTES)
    acess_token = create_acess_token(
        data={"sub": user.username}, expires_delta = acess_token_expire
    )
    return{"acess_token": acess_token, "token_type": "bearer"}


def verify_token(token:str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get(("sub"))
        if username is None:
            raise HTTPException(status_code=403, detail="Token inválido ou expirado")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Token inválido ou expirado")


@app.get("/verify-token/{token}")
async def verigy_user_token(token:str):
    verify_token(token=token)
    return{"Resposta": "Token é válido"}