from fastapi import APIRouter, Path, Query, HTTPException, status
from typing import List, Optional
from typing_extensions import Annotated
from src.schemas.articulos import LibroBase, LibroResponse

# Inicializamos el Router con su prefijo global para agrupar los endpoints de la API
router = APIRouter(prefix="/api/libros", tags=["Libros"])

# MOCK DB: Simulación de Base de Datos en memoria (Lista de diccionarios)
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
id_counter = 3 # Contador global para simular la clave primaria autoincremental

# 1. LEER TODOS LOS LIBROS (O FILTRAR)
@router.get("/", response_model=List[LibroResponse])
def obtener_libros(search: Annotated[Optional[str], Query(description="Filtrar libros por coincidencia en el título")] = None):
    # Parámetro Query opcional. Si se envía, filtra ignorando mayúsculas/minúsculas (.lower())
    if search:
        return [l for l in DB_LIBROS if search.lower() in l["titulo"].lower()]
    return DB_LIBROS

# 2. LEER UN LIBRO POR ID
@router.get("/{id}", response_model=LibroResponse, responses={404: {"description": "Libro no encontrado"}})
def obtener_libro_por_id(id: Annotated[int, Path(description="ID del libro a buscar", ge=1)]):
    # 'ge=1' (Greater or Equal) valida que el parámetro de ruta sea un número positivo válido
    for libro in DB_LIBROS:
        if libro["id"] == id:
            return libro
    # Manejo de excepciones controladas: Si no matchea el ID, corta la ejecución y lanza error 404
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")

# 3. CREAR UN LIBRO
@router.post("/", response_model=LibroResponse, status_code=status.HTTP_201_CREATED)
def crear_libro(libro: LibroBase):
    global id_counter
    # .model_dump() transforma el objeto Pydantic validado en un diccionario estándar de Python
    nuevo_libro = libro.model_dump()
    nuevo_libro["id"] = id_counter # Inyectamos el ID autoincremental generado por el servidor
    
    DB_LIBROS.append(nuevo_libro)
    id_counter += 1 # Incrementamos el contador para el próximo registro
    return nuevo_libro

# 4. ACTUALIZAR UN LIBRO (REEMPLAZO COMPLETO VIA PUT)
@router.put("/{id}", response_model=LibroResponse, responses={404: {"description": "Libro no encontrado"}})
def actualizar_libro(id: Annotated[int, Path(ge=1)], libro_editado: LibroBase):
    # Usamos enumerate para obtener el índice y modificar directamente la posición de la lista
    for idx, libro in enumerate(DB_LIBROS):
        if libro["id"] == id:
            datos_actualizados = libro_editado.model_dump()
            datos_actualizados["id"] = id # Mantenemos el ID original de la URL en el recurso
            DB_LIBROS[idx] = datos_actualizados # Reemplazo en memoria
            return datos_actualizados
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")

# 5. ELIMINAR UN LIBRO
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"description": "Libro no encontrado"}})
def eliminar_libro(id: Annotated[int, Path(ge=1)]):
    for idx, libro in enumerate(DB_LIBROS):
        if libro["id"] == id:
            DB_LIBROS.pop(idx) # Extirpa el elemento de la lista por su índice
            return # Retorna vacío (Buena práctica REST para código 204: No Content)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado")