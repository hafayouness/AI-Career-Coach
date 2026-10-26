import PDFDocument from "pdfkit";

export const pdfGenerationService = {
  async generatePDF(content) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 55, right: 55 },
          info: {
            Title: `CV — ${content.header.name}`,
            Author: content.header.name,
          },
        });

        const chunks = [];
        doc.on("data", (c) => chunks.push(c));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const PAGE_WIDTH = doc.page.width - 110;
        const COLORS = {
          text: "#0a0a0a",
          muted: "#57534e",
          accent: "#84cc16",
        };

        doc
          .font("Helvetica-Bold")
          .fontSize(22)
          .fillColor(COLORS.text)
          .text(content.header.name, { align: "left" });

        const contact = [content.header.email, content.header.phone]
          .filter(Boolean)
          .join(" · ");
        if (contact) {
          doc
            .moveDown(0.2)
            .font("Helvetica")
            .fontSize(10)
            .fillColor(COLORS.muted)
            .text(contact);
        }

        doc.moveDown(0.6);
        doc
          .moveTo(55, doc.y)
          .lineTo(PAGE_WIDTH + 55, doc.y)
          .strokeColor(COLORS.accent)
          .lineWidth(1.5)
          .stroke();
        doc.moveDown(0.6);

        if (content.header.summary) {
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor(COLORS.text)
            .text(content.header.summary, { align: "justify" });
          doc.moveDown(0.8);
        }

        const section = (title, renderer) => {
          if (doc.y > doc.page.height - 100) doc.addPage();
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor(COLORS.text)
            .text(title.toUpperCase(), { characterSpacing: 0.8 });
          doc.moveDown(0.3);
          doc
            .moveTo(55, doc.y)
            .lineTo(PAGE_WIDTH + 55, doc.y)
            .strokeColor("#e7e5e4")
            .lineWidth(0.5)
            .stroke();
          doc.moveDown(0.5);
          renderer();
          doc.moveDown(0.8);
        };

        if (content.skills?.length) {
          section("Compétences", () => {
            doc
              .font("Helvetica")
              .fontSize(10)
              .fillColor(COLORS.text)
              .text(content.skills.join(" · "), { lineGap: 3 });
          });
        }

        if (content.experiences?.length) {
          section("Expériences professionnelles", () => {
            content.experiences.forEach((exp) => {
              if (doc.y > doc.page.height - 90) doc.addPage();
              doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor(COLORS.text)
                .text(exp.title);
              const meta = [
                exp.company,
                exp.startDate && exp.endDate
                  ? `${exp.startDate} – ${exp.endDate}`
                  : exp.startDate || exp.endDate,
              ]
                .filter(Boolean)
                .join(" · ");
              if (meta) {
                doc
                  .font("Helvetica-Oblique")
                  .fontSize(9)
                  .fillColor(COLORS.muted)
                  .text(meta);
              }
              doc.moveDown(0.2);
              if (exp.description) {
                doc
                  .font("Helvetica")
                  .fontSize(10)
                  .fillColor(COLORS.text)
                  .text(exp.description, { lineGap: 2 });
              }
              doc.moveDown(0.6);
            });
          });
        }

        if (content.education?.length) {
          section("Formation", () => {
            content.education.forEach((edu) => {
              if (doc.y > doc.page.height - 60) doc.addPage();
              doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(COLORS.text)
                .text(edu.degree);
              const meta = [edu.institution, edu.year]
                .filter(Boolean)
                .join(" · ");
              if (meta) {
                doc
                  .font("Helvetica")
                  .fontSize(9)
                  .fillColor(COLORS.muted)
                  .text(meta);
              }
              doc.moveDown(0.4);
            });
          });
        }

        if (content.languages?.length) {
          section("Langues", () => {
            doc
              .font("Helvetica")
              .fontSize(10)
              .fillColor(COLORS.text)
              .text(
                content.languages
                  .map((l) => `${l.language}${l.level ? ` (${l.level})` : ""}`)
                  .join(" · "),
              );
          });
        }

        if (content.certifications?.length) {
          section("Certifications", () => {
            content.certifications.forEach((c) => {
              doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(COLORS.text)
                .text("• " + c, { lineGap: 2 });
            });
          });
        }

        if (content.projects?.length) {
          section("Projets", () => {
            content.projects.forEach((p) => {
              if (doc.y > doc.page.height - 60) doc.addPage();
              doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(COLORS.text)
                .text(p.name);
              if (p.description) {
                doc
                  .font("Helvetica")
                  .fontSize(10)
                  .fillColor(COLORS.text)
                  .text(p.description, { lineGap: 2 });
              }
              doc.moveDown(0.4);
            });
          });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },
};
