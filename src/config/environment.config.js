import dotenv from 'dotenv'
//Carga todas las variables de entorno dentro de process.env
dotenv.config()


//Creamos una constante de facil acceso a mis variables de entorno
const ENVIRONMENT = {
    PORT: process.env.PORT,
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    BACKEND_URL: process.env.BACKEND_URL
};

//prueba

export default ENVIRONMENT