# Buat folder src dan subfolder-nya
mkdir -p src/{config,controllers,models,routes,services,middlewares,utils}

# Buat folder untuk pengujian
mkdir -p tests

# Buat folder untuk file statis
mkdir -p public/{images,css}

# Buat file di root project
touch .env .gitignore README.md package.json

# Selesai
echo "Struktur folder dan file berhasil dibuat!"
