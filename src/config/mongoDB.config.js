import mongoose from 'mongoose'
import ENVIRONMENT from './environment.config.js'


async function connectMongoDB() {
    try {
        await mongoose.connect(ENVIRONMENT.MONGO_DB_CONNECTION_STRING, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 60000,
        });

        console.log("Conexión con MongoDB exitosa");
    } catch (error) {
        console.error("Error al conectar con MongoDB:");
        console.error(error.message);
        process.exit(1);
    }
}


export default connectMongoDB