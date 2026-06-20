const PDFDocument = require('pdfkit');

/**
 * Génère un PDF de feuille de route et retourne un Buffer
 */
const generateRoutePDF = (route, agentName) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primaryColor = '#2E7D32';
    const lightGray = '#F5F5F5';
    const darkGray = '#424242';

    // ── En-tête ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
      .text('FEUILLE DE TOURNÉE', 50, 25, { align: 'left' });
    doc.fontSize(11).font('Helvetica')
      .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 50, 52);

    doc.fillColor(darkGray);

    // ── Infos générales ───────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor)
      .text('Informations générales', { underline: false });

    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor(darkGray);

    const info = [
      ['Date', new Date(route.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
      ['Statut', route.status.toUpperCase()],
      ['Agent', agentName || route.agentId || 'Non assigné'],
      ['Distance totale', route.totalDistance ? `${route.totalDistance} km` : 'Non calculée'],
      ['Durée estimée', route.estimatedTime ? `${route.estimatedTime} min (${Math.floor(route.estimatedTime / 60)}h${route.estimatedTime % 60}min)` : 'Non calculée'],
      ['Heure de début', route.startTime ? new Date(route.startTime).toLocaleTimeString('fr-FR') : 'Non définie'],
      ['Heure de fin prévue', route.endTime ? new Date(route.endTime).toLocaleTimeString('fr-FR') : 'Non définie'],
    ];

    info.forEach(([label, value], i) => {
      const y = doc.y;
      if (i % 2 === 0) doc.rect(50, y - 3, doc.page.width - 100, 18).fill(lightGray);
      doc.fillColor(darkGray)
        .font('Helvetica-Bold').text(`${label} :`, 55, y, { continued: true, width: 180 })
        .font('Helvetica').text(` ${value}`);
    });

    // ── Étapes de la tournée ──────────────────────────────────────────────
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor)
      .text('Étapes de la tournée');

    doc.moveDown(0.5);

    if (!route.steps || route.steps.length === 0) {
      doc.fontSize(11).font('Helvetica').fillColor(darkGray)
        .text('Aucune étape définie pour cette route.');
    } else {
      const sorted = [...route.steps].sort((a, b) => a.stepOrder - b.stepOrder);

      // En-tête du tableau
      doc.rect(50, doc.y, doc.page.width - 100, 20).fill(primaryColor);
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
      const headerY = doc.y + 5;
      doc.text('#', 55, headerY, { width: 25 });
      doc.text('Zone', 85, headerY, { width: 70 });
      doc.text('Type', 160, headerY, { width: 80 });
      doc.text('Remplissage', 245, headerY, { width: 80 });
      doc.text('Distance', 330, headerY, { width: 70 });
      doc.text('Temps', 405, headerY, { width: 60 });
      doc.moveDown(1.2);

      sorted.forEach((step, i) => {
        const c = step.container;
        const rowY = doc.y;

        if (i % 2 === 0) doc.rect(50, rowY - 2, doc.page.width - 100, 16).fill(lightGray);

        doc.fillColor(darkGray).fontSize(10).font('Helvetica');
        doc.text(String(step.stepOrder), 55, rowY, { width: 25 });
        doc.text(c?.zoneId ?? '—', 85, rowY, { width: 70 });
        doc.text(c?.type ?? '—', 160, rowY, { width: 80 });

        // Indicateur visuel remplissage
        const fill = c?.fillLevel ?? 0;
        const fillColor = fill >= 80 ? '#D32F2F' : fill >= 50 ? '#F57C00' : '#388E3C';
        doc.fillColor(fillColor).text(`${fill}%`, 245, rowY, { width: 80 });
        doc.fillColor(darkGray);

        doc.text(step.distanceFromPrevious != null ? `${step.distanceFromPrevious} km` : '—', 330, rowY, { width: 70 });
        doc.text(step.estimatedTimeFromPrevious != null ? `${step.estimatedTimeFromPrevious} min` : '—', 405, rowY, { width: 60 });
        doc.moveDown(0.9);
      });
    }

    // ── Résumé final ─────────────────────────────────────────────────────
    doc.moveDown(1);
    doc.rect(50, doc.y, doc.page.width - 100, 1).fill('#BDBDBD');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#9E9E9E')
      .text('Document généré automatiquement par EcoTrack • Service Routes', {
        align: 'center',
      });

    doc.end();
  });

module.exports = { generateRoutePDF };
