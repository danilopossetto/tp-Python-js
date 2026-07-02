from pydantic import BaseModel, Field
from typing_extensions import Annotated

# MOLDE BASE: Define la estructura de datos obligatoria para recibir peticiones (Request Body).
# No incluye ID porque el ID se genera de forma automática en el servidor al crear o editar.
class LibroBase(BaseModel):
    # Usamos Annotated + Field para aplicar validaciones del lado del servidor (Data Validation)
    titulo: Annotated[str, Field(description="Título del libro", min_length=1, max_length=100)]
    autor: Annotated[str, Field(description="Autor del libro", min_length=2, max_length=50)]
    paginas: Annotated[int, Field(description="Cantidad de páginas", gt=0)] # 'gt=0' exige que sea mayor a cero
    cover_image: Annotated[str, Field(description="URL de la imagen de portada")]

# MOLDE DE RESPUESTA: Aplica herencia para reutilizar los campos de LibroBase.
# Agrega el campo 'id' porque el Frontend (JS) necesita este dato para renderizar y operar en la UI.
class LibroResponse(LibroBase):
    id: Annotated[int, Field(description="Identificador único autoincremental")]