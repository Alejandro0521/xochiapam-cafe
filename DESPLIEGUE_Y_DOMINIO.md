# Guía de Despliegue en GitHub Pages y Vinculación de Dominio Gratuito
**Xochiapam Café — San Pedro Sochiapam, Oaxaca**

Esta guía contiene los pasos exactos para subir el proyecto a GitHub, activar el alojamiento gratuito en GitHub Pages y conectarle un dominio gratuito a través de FreeDomain o registros abiertos de la comunidad.

---

## Paso 1: Subir el proyecto a tu cuenta de GitHub

1. Entra a [github.com](https://github.com) e inicia sesión con tu cuenta.
2. Crea un nuevo repositorio público o privado haciendo clic en el botón **New** (por ejemplo: `xochiapam-cafe`).
3. En tu terminal, dentro de esta carpeta, ejecuta los siguientes comandos sustituyendo `<tu-usuario>` por tu nombre de usuario de GitHub:

```bash
# Vincular el repositorio remoto de GitHub
git remote add origin https://github.com/<tu-usuario>/xochiapam-cafe.git

# Enviar la rama principal con todo el código
git branch -M main
git push -u origin main
```

---

## Paso 2: Activar el alojamiento gratuito (GitHub Pages)

1. En la página de tu repositorio en GitHub, ve a la pestaña **Settings** (Configuración).
2. En la barra lateral izquierda, haz clic en **Pages**.
3. En el apartado **Build and deployment > Source**, selecciona:
   - **GitHub Actions**
4. El flujo de trabajo que ya dejamos configurado en `.github/workflows/deploy.yml` ejecutará automáticamente la suite de pruebas (36 pruebas) y publicará tu sitio en:
   `https://<tu-usuario>.github.io/xochiapam-cafe/`

---

## Paso 3: Obtener tu dominio gratuito

Tienes dos opciones recomendadas sin costo:

### Opción A: DigitalPlat FreeDomain (Recomendada)
1. Entra al panel oficial: [dash.domain.digitalplat.org](https://dash.domain.digitalplat.org).
2. Inicia sesión directamente con tu cuenta de GitHub.
3. Elige tu subdominio (por ejemplo: `xochiapam.us.kg` o `xochiapam.dpdns.org`).
4. En la configuración de registros DNS de tu nuevo dominio, añade un registro **CNAME**:
   - **Tipo:** CNAME
   - **Nombre:** `@` (o el subdominio que elijas)
   - **Destino / Target:** `<tu-usuario>.github.io`
   - **TTL:** Automático

### Opción B: is-a.dev (Comunidad de desarrolladores)
1. Visita el repositorio oficial en GitHub: `https://github.com/is-a-dev/register`.
2. Haz clic en **Fork** para copiar el repositorio a tu cuenta.
3. En la carpeta `domains/`, crea un archivo llamado `xochiapam.json` con el siguiente contenido:

```json
{
  "owner": {
    "username": "<tu-usuario>",
    "email": "<tu-correo>"
  },
  "records": {
    "CNAME": "<tu-usuario>.github.io"
  }
}
```

4. Haz commit y abre un **Pull Request**. Los bots de GitHub Actions validan y aprueban el dominio en minutos, otorgándote `xochiapam.is-a.dev`.

---

## Paso 4: Vincular el dominio en GitHub Pages

Una vez que tengas tu dominio registrado (por ejemplo, `xochiapam.us.kg`):

1. En la raíz de este proyecto, crea o edita el archivo `CNAME` con una sola línea que contenga tu dominio:
   ```text
   xochiapam.us.kg
   ```
2. Haz commit y push:
   ```bash
   git add CNAME
   git commit -m "feat(domain): add custom domain CNAME"
   git push origin main
   ```
3. En GitHub, dentro de **Settings > Pages > Custom domain**, confirma que aparezca tu dominio y marca la casilla **Enforce HTTPS** (Forzar HTTPS) para que el certificado SSL sea emitido automáticamente.
