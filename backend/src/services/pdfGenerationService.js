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

        const cleanText = (text) => {
          if (!text) return "";
          return String(text)
            .replace(/^#+\s*/g, "")
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            .replace(/[\u00A0\u2000-\u200B]/g, " ")
            .trim();
        };

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
            .text(cleanText(title), 50, doc.y, { width: PAGE_W });
          drawLine();
        };

        const titleWithDate = (title, date) => {
          const cleanTitle = cleanText(title);
          const cleanDate = cleanText(date || "");
          const startY = doc.y;

          const DATE_WIDTH = 140;
          const TITLE_WIDTH = PAGE_W - DATE_WIDTH - 8;

          const titleHeight = doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .heightOfString(cleanTitle, { width: TITLE_WIDTH });

          doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#000000")
            .text(cleanTitle, 50, startY, {
              width: TITLE_WIDTH,
              align: "left",
            });

          if (cleanDate) {
            doc
              .font("Helvetica-Oblique")
              .fontSize(9)
              .fillColor("#57534e")
              .text(cleanDate, 50 + TITLE_WIDTH + 8, startY, {
                width: DATE_WIDTH,
                align: "right",
              });
          }

          doc.x = 50;
          doc.y = startY + titleHeight + 4;
        };

        doc
          .font("Times-Bold")
          .fontSize(22)
          .fillColor("#000000")
          .text(
            cleanText(content.header?.name || "").toUpperCase(),
            50,
            doc.y,
            {
              align: "center",
              width: PAGE_W,
            },
          );
        doc.moveDown(0.3);

        const contactItems = [
          content.header?.phone && {
            text: cleanText(content.header.phone),
            link: null,
          },
          content.header?.email && {
            text: cleanText(content.header.email),
            link: `mailto:${content.header.email}`,
          },
          content.header?.github && {
            text: "GitHub",
            link: content.header.github.startsWith("http")
              ? content.header.github
              : `https://${content.header.github}`,
          },
          content.header?.linkedin && {
            text: "LinkedIn",
            link: content.header.linkedin.startsWith("http")
              ? content.header.linkedin
              : `https://${content.header.linkedin}`,
          },
          content.header?.portfolio && {
            text: "Portfolio",
            link: content.header.portfolio.startsWith("http")
              ? content.header.portfolio
              : `https://${content.header.portfolio}`,
          },
        ].filter(Boolean);

        if (contactItems.length > 0) {
          doc.font("Times-Roman").fontSize(10).fillColor("#1e3a8a");
          const totalWidth = contactItems.reduce((acc, item, i) => {
            return (
              acc +
              doc.widthOfString(item.text) +
              (i < contactItems.length - 1 ? 15 : 0)
            );
          }, 0);
          let currentX = 50 + (PAGE_W - totalWidth) / 2;
          const startY = doc.y;
          contactItems.forEach((item, i) => {
            doc.text(item.text, currentX, startY, {
              link: item.link || undefined,
              underline: !!item.link,
            });
            currentX += doc.widthOfString(item.text);
            if (i < contactItems.length - 1) {
              doc.fillColor("#a8a29e").text(" | ", currentX, startY);
              currentX += 15;
            }
          });
          doc.x = 50;
          doc.moveDown(1);
        }

        if (content.header?.summary) {
          doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#000000")
            .text(cleanText(content.header.summary), 50, doc.y, {
              align: "justify",
              width: PAGE_W,
            });
          doc.moveDown(1);
        }

        const skills = content.skills;
        if (Array.isArray(skills) && skills.length > 0) {
          sectionTitle("Compétences");
          doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#000000")
            .text(skills.join(" · "), 50, doc.y, { width: PAGE_W });
          doc.moveDown(1);
        } else if (skills && typeof skills === "object") {
          sectionTitle("Compétences");
          const categories = [
            { key: "langages", label: "Langages" },
            { key: "frameworks", label: "Frameworks & Libraries" },
            { key: "outils", label: "Outils" },
            { key: "methodologies", label: "Méthodologies" },
          ];
          categories.forEach(({ key, label }) => {
            if (Array.isArray(skills[key]) && skills[key].length > 0) {
              doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#000000")
                .text(`${label} : `, 50, doc.y, { continued: true });
              doc
                .font("Helvetica")
                .text(skills[key].join(", "), { width: PAGE_W });
              doc.moveDown(0.2);
            }
          });
          doc.moveDown(0.8);
        }

        if (content.experiences?.length) {
          sectionTitle("Expérience");
          content.experiences.forEach((exp) => {
            if (doc.y > doc.page.height - 90) doc.addPage();

            titleWithDate(exp.title_and_company || exp.title, exp.dates);

            if (exp.context) {
              doc
                .font("Helvetica")
                .fontSize(9.5)
                .fillColor("#000000")
                .text(cleanText(exp.context), 50, doc.y, {
                  align: "justify",
                  width: PAGE_W,
                });
              doc.moveDown(0.2);
            }
            if (exp.missions?.length) {
              exp.missions.forEach((m) => {
                doc
                  .font("Helvetica")
                  .fontSize(9.5)
                  .fillColor("#000000")
                  .text(`- ${cleanText(m)}`, 50, doc.y, {
                    indent: 15,
                    align: "justify",
                    width: PAGE_W,
                  });
              });
              doc.moveDown(0.2);
            }
            if (exp.result) {
              doc
                .font("Helvetica-Oblique")
                .fontSize(9.5)
                .fillColor("#000000")
                .text(cleanText(exp.result), 50, doc.y, {
                  align: "justify",
                  width: PAGE_W,
                });
            }
            doc.moveDown(0.8);
          });
        }

        if (content.projects?.length) {
          sectionTitle("Projets");
          content.projects.forEach((proj) => {
            if (doc.y > doc.page.height - 60) doc.addPage();
            titleWithDate(proj.name, proj.dates);
            if (proj.missions?.length) {
              proj.missions.forEach((m) => {
                doc
                  .font("Helvetica")
                  .fontSize(9.5)
                  .fillColor("#000000")
                  .text(`- ${cleanText(m)}`, 50, doc.y, {
                    indent: 15,
                    align: "justify",
                    width: PAGE_W,
                  });
              });
              doc.moveDown(0.2);
            }
            if (proj.result) {
              doc
                .font("Helvetica")
                .fontSize(9.5)
                .fillColor("#000000")
                .text(cleanText(proj.result), 50, doc.y, {
                  align: "justify",
                  width: PAGE_W,
                });
            }
            doc.moveDown(0.8);
          });
        }

        /* ==================== 6. FORMATIONS ==================== */
        if (content.education?.length) {
          sectionTitle("Formations et Certifications");
          const sorted = [...content.education].sort((a, b) => {
            const yearA = parseInt(
              (a.dates || a.year || "0").match(/\d{4}/)?.[0] || "0",
              10,
            );
            const yearB = parseInt(
              (b.dates || b.year || "0").match(/\d{4}/)?.[0] || "0",
              10,
            );
            return yearB - yearA;
          });
          sorted.forEach((edu) => {
            if (doc.y > doc.page.height - 60) doc.addPage();
            const dates =
              edu.dates ||
              [edu.startDate, edu.endDate].filter(Boolean).join(" – ") ||
              edu.year ||
              "";
            titleWithDate(edu.title || edu.degree, dates);
            if (edu.details?.length) {
              edu.details.forEach((d) => {
                doc
                  .font("Helvetica")
                  .fontSize(9.5)
                  .fillColor("#000000")
                  .text(`- ${cleanText(d)}`, 50, doc.y, {
                    indent: 15,
                    align: "justify",
                    width: PAGE_W,
                  });
              });
            }
            doc.moveDown(0.6);
          });
        }

        if (content.languages) {
          if (doc.y > doc.page.height - 60) doc.addPage();
          drawLine();
          let langs = [];
          if (Array.isArray(content.languages)) {
            langs = content.languages.map((l) => {
              if (typeof l === "string") return l;
              return `${l.language || ""}${l.level ? ` : ${l.level}` : ""}`;
            });
          } else if (typeof content.languages === "string") {
            langs = [content.languages];
          } else if (typeof content.languages === "object") {
            langs = Object.entries(content.languages).map(
              ([k, v]) => `${k} : ${v}`,
            );
          }
          const langsStr = langs.filter(Boolean).join("  |  ");
          if (langsStr) {
            doc
              .font("Helvetica-Bold")
              .fontSize(10)
              .fillColor("#000000")
              .text("Langues", 50, doc.y, { continued: true });
            doc.font("Helvetica").text(`   ${langsStr}`, { width: PAGE_W });
          }
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },
};
