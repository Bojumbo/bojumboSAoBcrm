import { SaleStatusTypeService } from '../services/saleStatusTypeService.js';
export class SaleStatusTypeController {
    static async getAll(_req, res) {
        try {
            const items = await SaleStatusTypeService.getAll();
            res.json({ success: true, data: items });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    static async getById(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ success: false, error: 'Invalid ID' });
        try {
            const item = await SaleStatusTypeService.getById(id);
            if (!item)
                return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, data: item });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    static async create(req, res) {
        try {
            const item = await SaleStatusTypeService.create({ name: req.body.name });
            res.status(201).json({ success: true, data: item });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    static async update(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ success: false, error: 'Invalid ID' });
        try {
            const item = await SaleStatusTypeService.update(id, { name: req.body.name });
            res.json({ success: true, data: item });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    static async delete(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ success: false, error: 'Invalid ID' });
        try {
            const ok = await SaleStatusTypeService.delete(id);
            if (!ok)
                return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, message: 'Deleted' });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}
//# sourceMappingURL=saleStatusTypeController.js.map