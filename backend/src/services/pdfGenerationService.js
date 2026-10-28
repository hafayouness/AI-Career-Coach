import PDFDocument from "pdfkit";

export const pdfGenerationService = {
  async generatePDF(content) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 40, bottom: 40, left: 50, right: 50 },
        });

        const chunks = [];
        doc.on("data", (c) => chunks.push(c));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const PAGE_W = doc.page.width - 100;

        const drawLine = () => {
          doc.moveDown(0.2);
          doc
            .moveTo(50, doc.y)
            .lineTo(PAGE_W + 50, doc.y)
            .strokeColor("#a8a29e")
            .lineWidth(0.8)
            .stroke();
          doc.moveDown(0.5);
        };

        const sectionTitle = (title) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#000000")
            .text(title);
          drawLine();
        };

        // 1. En-tête
        doc
          .font("Times-Bold")
          .fontSize(22)
          .fillColor("#000000")
          .text(content.header.name.toUpperCase(), { align: "center" });
        doc.moveDown(0.2);
        const contact = [content.header.email, content.header.phone]
          .filter(Boolean)
          .join(" | ");
        if (contact) {
          doc
            .font("Times-Roman")
            .fontSize(10)
            .fillColor("#1e3a8a")
            .text(contact, { align: "center" });
        }
        doc.moveDown(1);

        // 2. Profil
        if (content.header.summary) {
          doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#000000")
            .text(content.header.summary, { align: "justify" });
          doc.moveDown(1);
        }

        // 3. Compétences
        if (content.skills) {
          sectionTitle("Compétences");
          doc.font("Helvetica").fontSize(10);
          if (content.skills.langages?.length) {
            doc
              .font("Helvetica-Bold")
              .text("Langages : ", { continued: true })
              .font("Helvetica")
              .text(content.skills.langages.join(", "));
          }
          if (content.skills.frameworks?.length) {
            doc
              .font("Helvetica-Bold")
              .text("Frameworks & Libraries : ", { continued: true })
              .font("Helvetica")
              .text(content.skills.frameworks.join(", "));
          }
          if (content.skills.outils?.length) {
            doc
              .font("Helvetica-Bold")
              .text("Outils : ", { continued: true })
              .font("Helvetica")
              .text(content.skills.outils.join(", "));
          }
          if (content.skills.methodologies?.length) {
            doc
              .font("Helvetica-Bold")
              .text("Méthodologies : ", { continued: true })
              .font("Helvetica")
              .text(content.skills.methodologies.join(", "));
          }
          doc.moveDown(1);
        }

        // 4. Expériences
        if (content.experiences?.length) {
          sectionTitle("Experience");
          content.experiences.forEach((exp) => {
            if (doc.y > doc.page.height - 90) doc.addPage();
            doc
              .font("Helvetica-Bold")
              .fontSize(10)
              .text(exp.title_and_company || "", { continued: true })
              .font("Helvetica-Oblique")
              .fontSize(9)
              .text(`  ${exp.dates || ""}`);
            if (exp.context) {
              doc.moveDown(0.2);
              doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor("#000000")
                .text(exp.context, { align: "justify" });
            }
            if (exp.missions?.length) {
              doc.moveDown(0.2);
              exp.missions.forEach((m) => {
                doc
                  .font("Helvetica")
                  .fontSize(10)
                  .fillColor("#000000")
                  .text(`•  ${m}`, { indent: 15, align: "justify" });
              });
            }
            if (exp.result) {
              doc.moveDown(0.2);
              doc
                .font("Helvetica-Oblique")
                .fontSize(10)
                .fillColor("#000000")
                .text(exp.result, { align: "justify" });
            }
            doc.moveDown(0.8);
          });
        }

        // 5. Projets
        if (content.projects?.length) {
          sectionTitle("Projets");
          content.projects.forEach((proj) => {
            if (doc.y > doc.page.height - 60) doc.addPage();
            doc
              .font("Helvetica-Bold")
              .fontSize(10)
              .text(proj.name || "", { continued: true })
              .font("Helvetica-Oblique")
              .fontSize(9)
              .text(`  ${proj.dates || ""}`);
            if (proj.missions?.length) {
              doc.moveDown(0.2);
              proj.missions.forEach((m) => {
                doc
                  .font("Helvetica")
                  .fontSize(10)
                  .fillColor("#000000")
                  .text(`•  ${m}`, { indent: 15, align: "justify" });
              });
            }
            if (proj.result) {
              doc.moveDown(0.2);
              doc
                .font("Helvetica-Oblique")
                .fontSize(10)
                .fillColor("#000000")
                .text(proj.result, { align: "justify" });
            }
            doc.moveDown(0.8);
          });
        }

        // 6. Formations et Certifications
        if (content.education?.length) {
          sectionTitle("Formations et Certifications");
          content.education.forEach((edu) => {
            doc
              .font("Helvetica-Bold")
              .fontSize(10)
              .text(edu.title || "", { continued: true })
              .font("Helvetica-Oblique")
              .fontSize(9)
              .text(`  ${edu.dates || ""}`);
            if (edu.details?.length) {
              doc.moveDown(0.1);
              edu.details.forEach((d) => {
                doc
                  .font("Helvetica")
                  .fontSize(10)
                  .fillColor("#000000")
                  .text(`•  ${d}`, { indent: 15, align: "justify" });
              });
            }
            doc.moveDown(0.6);
          });
        }

        // 7. Langues
        if (content.languages) {
          drawLine();
          doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("Langues", { continued: true });
          doc.font("Helvetica").text(`   ${content.languages}`);
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },
};
