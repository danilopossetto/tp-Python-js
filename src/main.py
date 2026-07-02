from fastapi import FastAPI
from src.routers.articulos import router as articulos_router
from fastapi.middleware.cors import CORSMiddleware

# Instancia principal de la API - El título personaliza la documentación en /docs
app = FastAPI(title="Library Vault API")

# CONFIGURACIÓN DE CORS: Permite que el frontend (JS) se conecte desde el navegador
# sin que el sistema de seguridad de origen cruzado bloquee las peticiones locales.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # Autoriza a cualquier origen/puerto a consultar
    allow_credentials=True,
    allow_methods=["*"],     # Habilita todos los verbos HTTP (GET, POST, PUT, DELETE)
    allow_headers=["*"],     # Permite cualquier tipo de cabecera en las peticiones
)

# Acoplamos el router modularizado de artículos a la aplicación central
app.include_router(articulos_router)