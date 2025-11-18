import PresenceService from "../services/presence.service.js";

class PresenceController {
    static async ping(req, res) {
        try {
            await PresenceService.setOnline(req.user.id);
            return res.json({ ok: true });
        } catch (e) {
            return res.status(e.status || 500).json({ ok: false, message: e.message || "Error" });
        }
    }

    static async logout(req, res) {
        try {
            await PresenceService.setOffline(req.user.id);
            return res.json({ ok: true });
        } catch (e) {
            return res.status(e.status || 500).json({ ok: false, message: e.message || "Error" });
        }
    }

    static async getOne(req, res) {
        try {
            const data = await PresenceService.getPresence(req.params.user_id);
            return res.json({ ok: true, data });
        } catch (e) {
            return res.status(e.status || 500).json({ ok: false, message: e.message || "Error" });
        }
    }
}

export default PresenceController;
