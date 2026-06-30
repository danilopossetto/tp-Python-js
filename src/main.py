from fastapi import FastAPI
from src.routers import router
# Importamos la herramienta de permisos
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Library Vault API")

# Configuración de CORS para que JavaScript pueda consultar desde el navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite que cualquier frontend se conecte
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE
    allow_headers=["*"],
)

app.include_router(router)
