from fastapi import APIRouter, Path, Query, HTTPException, status
from typing import List, Optional, Annotated  # Importación nativa de Python 3.9+
from src.models import LibroBase, LibroResponse

router = APIRouter(prefix="/api/libros", tags=["Libros"])

# --- BASE DE DATOS EN MEMORIA ---
DB_LIBROS = [
    {
        "id": 1, 
        "titulo": "El Aleph", 
        "autor": "Jorge Luis Borges", 
        "paginas": 180, 
        "cover_image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500"
    },
    {
        "id": 2, 
        "titulo": "Ficciones", 
        "autor": "Jorge Luis Borges", 
        "paginas": 220, 
        "cover_image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=500"
    }
]
id_counter = 3

# --- 1. LEER TODOS LOS LIBROS ---
@router.get("/", response_model=List[LibroResponse])
def obtener_libros(search: Annotated[Optional[str], Query(description="Buscar por título")] = None):
    if search:
        return [l for l in DB_LIBROS if search.lower() in l["titulo"].lower()]
    return DB_LIBROS

# --- 2. LEER UN LIBRO POR ID ---
@router.get("/{id}", response_model=LibroResponse, responses={404: {"description": "Libro no encontrado"}})
def obtener_libro_por_id(id: Annotated[int, Path(description="id", ge=1)]):
    for libro in DB_LIBROS:
        if libro["id"] == id:
            return libro
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")

# --- 3. CREAR UN LIBRO ---
@router.post("/", response_model=LibroResponse, status_code=status.HTTP_201_CREATED)
def crear_libro(libro: LibroBase):
    global id_counter
    nuevo_libro = libro.model_dump()
    nuevo_libro["id"] = id_counter
    DB_LIBROS.append(nuevo_libro)
    id_counter += 1
    return nuevo_libro

# --- 4. ACTUALIZAR UN LIBRO ---
@router.put("/{id}", response_model=LibroResponse, responses={404: {"description": "Libro no encontrado"}})
def actualizar_libro(id: Annotated[int, Path(ge=1)], libro_editado: LibroBase):
    for idx, libro in enumerate(DB_LIBROS):
        if libro["id"] == id:
            datos_actualizados = libro_editado.model_dump()
            datos_actualizados["id"] = id
            DB_LIBROS[idx] = datos_actualizados
            return datos_actualizados
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")

# --- 5. ELIMINAR UN LIBRO ---
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"description": "Libro no encontrado"}})
def eliminar_libro(id: Annotated[int, Path(ge=1)]):
    for idx, libro in enumerate(DB_LIBROS):
        if libro["id"] == id:
            DB_LIBROS.pop(idx)
            return
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")