// 1. CONFIGURACIÓN INICIAL: URL de API en Python y captura de elementos
const API_URL = "http://127.0.0.1:8000/api/libros";

const navSearchBtn = document.getElementById("nav-search-btn");
const navProfileBtn = document.getElementById("nav-profile-btn");
const searchSection = document.getElementById("search-section");
const profileSection = document.getElementById("profile-section");

// 2. EVENTOS DE NAVEGACIÓN: Cambiar entre "Explorar" y "Mi Perfil" (Pestañas)

// Cuando el usuario hace clic en "Mi Perfil"
navProfileBtn.addEventListener("click", () => {
    profileSection.classList.remove("hidden");
    profileSection.classList.add("block");
    searchSection.classList.remove("block");
    searchSection.classList.add("hidden");
    
    navProfileBtn.classList.add("text-cyan-400", "border-b-2", "border-cyan-400");
    navSearchBtn.classList.remove("text-cyan-400", "border-b-2", "border-cyan-400");
    
    cargarPerfil(); // Cargamos los datos frescos del perfil
});

// Cuando el usuario hace clic en "Explorar"
navSearchBtn.addEventListener("click", () => {
    searchSection.classList.remove("hidden");
    searchSection.classList.add("block");
    profileSection.classList.remove("block");
    profileSection.classList.add("hidden");
    
    navSearchBtn.classList.add("text-cyan-400", "border-b-2", "border-cyan-400");
    navProfileBtn.classList.remove("text-cyan-400", "border-b-2", "border-cyan-400");
    
    renderizarLibros(todosLosLibros); // Volvemos a mostrar todo el catálogo
});


// 3. TRAER LOS LIBROS DESDE LA API 

const gallery = document.getElementById("gallery");
let todosLosLibros = []; 

async function obtenerLibros() {
    try {
        // Traemos los datos crudos y reales desde la base de datos de Python
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error en el servidor");
        
        // Guardamos la lista fresca en nuestra variable global de control
        todosLosLibros = await respuesta.json();
        
        // obligamos al sistema a refrescar el contenedor actual según corresponda
        if (profileSection.classList.contains("block")) {
            // Si el usuario está mirando el Perfil, cargamos favoritos actualizados
            cargarPerfil(); 
        } else {
            // Para cualquier otro caso (como estar en Explorar), mostramos todo el catálogo fresco
            renderizarLibros(todosLosLibros);
        }
        
        return true; 

    } catch (error) {
        console.error("Hubo un fallo:", error);
        gallery.innerHTML = `<p class="text-rose-400 col-span-full text-center py-8">⚠️ No se pudo conectar con la API en Python.</p>`;
        return false;
    }
}

// Función encargada de fabricar el HTML de las tarjetas
function renderizarLibros(lista) {
    if (!lista || lista.length === 0) {
        gallery.innerHTML = `<p class="text-slate-500 col-span-full text-center py-8">No hay libros para mostrar acá.</p>`;
        return;
    }

    const favoritosActuales = JSON.parse(localStorage.getItem("mis_favoritos")) || [];

    gallery.innerHTML = lista.map(libro => {
        // Aseguramos la comparación de IDs pasándolos a String por seguridad
        const yaEsFavorito = favoritosActuales.some(fav => String(fav.id) === String(libro.id)); 
        const iconoCorazon = yaEsFavorito ? "❤️" : "♡";

        return `
            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300 relative">
                
                <button onclick="alternarFavorito(${libro.id})" class="absolute top-6 right-6 z-10 bg-slate-950/80 p-2 rounded-full border border-slate-800 hover:scale-110 transition-transform text-rose-500 text-lg font-bold">
                    ${iconoCorazon}
                </button>

                <div class="aspect-[3/4] w-full bg-slate-950 rounded-xl overflow-hidden mb-4">
                    <img src="${libro.cover_image}" alt="${libro.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>

                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-1">${libro.titulo}</h3>
                        <p class="text-slate-400 text-sm mb-3">${libro.autor}</p>
                    </div>
                    
                    <div class="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs text-slate-500 mb-4">
                        <span>${libro.paginas} páginas</span>
                    </div>

                    <div class="flex gap-2 text-xs">
                        <button onclick="cargarFormularioEdicion(${libro.id})" class="flex-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-semibold py-2 rounded transition-all border border-amber-500/20">
                            Editar
                        </button>
                        <button onclick="eliminarLibro(${libro.id})" class="flex-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-semibold py-2 rounded transition-all border border-rose-500/20">
                            Eliminar
                        </button>
                    </div>
                </div>

            </div>
        `;
    }).join("");
}

obtenerLibros();


// 4. BUSCADOR EN TIEMPO REAL
const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", (evento) => {
    const textoUsuario = evento.target.value.toLowerCase();

    const librosFiltrados = todosLosLibros.filter(libro => {
        const coincideTitulo = libro.titulo.toLowerCase().includes(textoUsuario);
        const coincideAutor = libro.autor.toLowerCase().includes(textoUsuario);
        return coincideTitulo || coincideAutor;
    });

    renderizarLibros(librosFiltrados);
});

// 5. MANEJO DEL FORMULARIO (POST para Crear / PUT para Editar)

const libroForm = document.getElementById("libro-form");

libroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("libro-id").value;

    const datosLibro = {
        titulo: document.getElementById("input-titulo").value.trim(),
        autor: document.getElementById("input-autor").value.trim(),
        paginas: parseInt(document.getElementById("input-paginas").value) || 0,
        cover_image: document.getElementById("input-cover").value.trim() || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"
    };

    try {
        let url = `${API_URL}/`; 
        let metodo = "POST";

        if (id) {
            url = `${API_URL}/${id}`; 
            metodo = "PUT";
        }

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosLibro)
        });

        if (!respuesta.ok) {
            throw new Error(`El servidor respondió con código ${respuesta.status}`);
        }

        // Sincronizar LocalStorage si fue una EDICIÓN exitosa en Python
        if (id) {
            let favoritos = JSON.parse(localStorage.getItem("mis_favoritos")) || [];
            const indexFav = favoritos.findIndex(fav => String(fav.id) === String(id));
            
            if (indexFav !== -1) {
                favoritos[indexFav] = { id: parseInt(id), ...datosLibro };
                localStorage.setItem("mis_favoritos", JSON.stringify(favoritos));
            }
        }

        alert(id ? "¡Libro actualizado con éxito!" : "¡Libro agregado con éxito!");
        
        cancelarEdicion(); // Ahora sí va a existir abajo
        
        // Refrescar datos de inmediato
        await obtenerLibros(); 

    } catch (error) {
        console.error("Error detectado:", error);
        alert(`No se pudo guardar: ${error.message}`);
    }
});

// 6. ELIMINAR LIBRO
async function eliminarLibro(id) {
    if (!confirm("¿Seguro que querés eliminar este libro del catálogo?")) return;

    try {
        // 1. Petición DELETE a FastAPI con await
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) throw new Error("No se pudo eliminar del servidor");

        // 2. Limpieza inmediata del LocalStorage usando Strings para evitar fallas de tipo
        let favoritos = JSON.parse(localStorage.getItem("mis_favoritos")) || [];
        favoritos = favoritos.filter(libro => String(libro.id) !== String(id));
        localStorage.setItem("mis_favoritos", JSON.stringify(favoritos));

        alert("¡Libro eliminado correctamente!");
        
        // 3. Traemos la lista fresca del servidor y dejamos que controle el renderizado
        await obtenerLibros(); 

    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al intentar eliminar el libro.");
    }
}

// 7. PREPARAR EDICIÓN (PUT) Y LIMPIEZA 

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

function cargarFormularioEdicion(id) {
    const libro = todosLosLibros.find(l => String(l.id) === String(id));
    if (!libro) return;

    document.getElementById("libro-id").value = libro.id;
    document.getElementById("input-titulo").value = libro.titulo;
    document.getElementById("input-autor").value = libro.autor;
    document.getElementById("input-paginas").value = libro.paginas;
    document.getElementById("input-cover").value = libro.cover_image;

    formTitle.textContent = "Editar Libro Seleccionado";
    submitBtn.textContent = "Actualizar Cambios";
    cancelBtn.classList.remove("hidden");

    // Mover al usuario automáticamente a Explorar si edita desde Perfil
    searchSection.classList.remove("hidden");
    searchSection.classList.add("block");
    profileSection.classList.remove("block");
    profileSection.classList.add("hidden");
    
    navSearchBtn.classList.add("text-cyan-400", "border-b-2", "border-cyan-400");
    navProfileBtn.classList.remove("text-cyan-400", "border-b-2", "border-cyan-400");

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
    document.getElementById("libro-id").value = "";
    libroForm.reset();
    formTitle.textContent = "Agregar Nuevo Libro";
    submitBtn.textContent = "Guardar Libro";
    cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", cancelarEdicion);


// 8. GESTIÓN DE FAVORITOS (LocalStorage)

function alternarFavorito(id) {
    const libro = todosLosLibros.find(l => String(l.id) === String(id));
    if (!libro) return;

    let favoritos = JSON.parse(localStorage.getItem("mis_favoritos")) || [];
    const index = favoritos.findIndex(l => String(l.id) === String(id));

    if (index === -1) {
        favoritos.push(libro);
    } else {
        favoritos.splice(index, 1);
    }

    localStorage.setItem("mis_favoritos", JSON.stringify(favoritos));

    // Refrescamos según dónde esté parado el usuario
    if (profileSection.classList.contains("block")) {
        cargarPerfil(); 
    } else {
        renderizarLibros(todosLosLibros); 
    }
}

function cargarPerfil() {
    const favoritos = JSON.parse(localStorage.getItem("mis_favoritos")) || [];

    const profileCount = document.getElementById("profile-count");
    if (profileCount) {
        profileCount.textContent = `Tenés ${favoritos.length} libro(s) guardado(s) en tu bóveda personal.`;
    }

    renderizarLibros(favoritos);
}