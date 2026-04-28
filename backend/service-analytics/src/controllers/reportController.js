/**
 * Contrôleur pour les rapports
 * GET /api/analytics/reports
 * POST /api/analytics/reports/generate
 */
const reportService = require('../services/reportService');

/**
 * Lister les rapports
 * GET /api/analytics/reports
 */
exports.listReports = async (req, res, next) => {
    try {
        const { type, period, status, limit = 20, offset = 0 } = req.query;
        const reports = await reportService.listReports({ type, period, status, limit, offset });

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer un rapport par ID
 * GET /api/analytics/reports/:id
 */
exports.getReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await reportService.getReportById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Rapport non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Générer un rapport quotidien
 * POST /api/analytics/reports/daily
 */
exports.generateDailyReport = async (req, res, next) => {
    try {
        const { date } = req.body;
        const result = await reportService.generateDailyReport(date ? new Date(date) : new Date());

        res.status(201).json({
            success: true,
            message: 'Rapport quotidien généré avec succès',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Générer un rapport hebdomadaire
 * POST /api/analytics/reports/weekly
 */
exports.generateWeeklyReport = async (req, res, next) => {
    try {
        const { weekStart } = req.body;
        const result = await reportService.generateWeeklyReport(weekStart ? new Date(weekStart) : new Date());

        res.status(201).json({
            success: true,
            message: 'Rapport hebdomadaire généré avec succès',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Générer un rapport mensuel
 * POST /api/analytics/reports/monthly
 */
exports.generateMonthlyReport = async (req, res, next) => {
    try {
        const { year, month } = req.body;
        const result = await reportService.generateMonthlyReport(year, month);

        res.status(201).json({
            success: true,
            message: 'Rapport mensuel généré avec succès',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Exporter un rapport
 * GET /api/analytics/reports/:id/export
 */
exports.exportReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { format = 'json' } = req.query;
        
        const result = await reportService.exportReport(id, format);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Planifier un rapport automatique
 * POST /api/analytics/reports/schedule
 */
exports.scheduleReport = async (req, res, next) => {
    try {
        const { type, frequency, recipients, config } = req.body;
        const schedule = await reportService.scheduleReport({ type, frequency, recipients, config });

        res.status(201).json({
            success: true,
            message: 'Rapport planifié avec succès',
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};