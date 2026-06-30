from pydantic import BaseModel, Field
from typing import Annotated  # Importación nativa y moderna de Python

# --- MOLDE BASE (Para crear y editar) ---
class LibroBase(BaseModel):
    titulo: Annotated[str, Field(description="Título", min_length=1, max_length=100)]
    autor: Annotated[str, Field(description="Autor", min_length=2, max_length=50)]
    paginas: Annotated[int, Field(description="Páginas", gt=0)]
    cover_image: Annotated[str, Field(description="URL de la foto de portada")]

# --- MOLDE DE RESPUESTA (Para mostrar en pantalla) ---
class LibroResponse(LibroBase):
    id: Annotated[int, Field(description="id")]