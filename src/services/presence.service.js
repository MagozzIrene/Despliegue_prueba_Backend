import PresenceRepository from "../repositories/presence.repository.js";
import { ServerError } from "../utils/customError.utils.js";

const ONLINE_TTL_MS = 70_000;

class PresenceService {
    
    static async setOnline(userId) {
        if (!userId) throw new ServerError(401, "Usuario no autenticado");

        return PresenceRepository.update(userId, {
            is_online: true,
            last_ping: new Date(),
        });
    }

    static async setOffline(userId) {
        if (!userId) throw new ServerError(401, "Usuario no autenticado");

        return PresenceRepository.update(userId, {
            is_online: false,
            last_seen: new Date(),
        });
    }

    static async getPresence(userId) {
        const user = await PresenceRepository.get(userId);
        if (!user) throw new ServerError(404, "Usuario no encontrado");

        if (user.is_online && user.last_ping) {
            const age = Date.now() - new Date(user.last_ping).getTime();
            if (age > ONLINE_TTL_MS) {
                await PresenceRepository.update(userId, { is_online: false, last_seen: user.last_ping });
                return { is_online: false, last_seen: user.last_ping };
            }
        }

        const effectiveLastSeen = user.last_seen ?? user.created_at;

        return {
            is_online: !!user.is_online,
            last_seen: effectiveLastSeen || null,
        };
    }
}

export default PresenceService;
