import os

IGNORAR = {'.git', 'venv', '__pycache__', '.idea', '.vite', 'node_modules', 'dist', 'media', 'static'}

def listar_directorio(base_path="."):
    with open("contenido_directorio.txt", "w") as f:
        for root, dirs, files in os.walk(base_path):
            # Filtrar directorios ignorados
            dirs[:] = [d for d in dirs if d not in IGNORAR]
            level = root.replace(os.path.sep, "/").count("/")
            indent = "    " * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            sub_indent = "    " * (level + 1)
            for file in files:
                f.write(f"{sub_indent}{file}\n")

listar_directorio()