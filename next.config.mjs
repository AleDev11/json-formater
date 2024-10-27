/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activar exportación estática
  output: "export",

  // Eliminar basePath si estás usando dominio personalizado
  basePath: "",
};

export default nextConfig;
