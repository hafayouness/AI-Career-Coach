import { JobOffer } from "../models/index.js";
import { jobOfferParsingService } from "./jobOfferParsingService.js";

export const jobOfferService = {
  async create(userId, data) {
    const offer = await JobOffer.create({
      userId,
      title: data.title,
      company: data.company || null,
      description: data.description,
      sourceUrl: data.sourceUrl || null,
      location: data.location || null,
      parsingStatus: "pending",
    });

    // Parsing IA en arrière-plan
    this.parseInBackground(offer.id, data.description);

    return offer;
  },

  async parseInBackground(offerId, description) {
    try {
      await JobOffer.update(
        { parsingStatus: "processing" },
        { where: { id: offerId } },
      );

      const requirements = await jobOfferParsingService.parse(description);

      await JobOffer.update(
        {
          requirements,
          parsingStatus: "completed",
          parsingError: null,
        },
        { where: { id: offerId } },
      );
    } catch (err) {
      console.error(`JobOffer ${offerId} parsing échoué:`, err.message);
      await JobOffer.update(
        { parsingStatus: "failed", parsingError: err.message },
        { where: { id: offerId } },
      );
    }
  },

  async list(userId) {
    return JobOffer.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  },

  async get(userId, id) {
    const offer = await JobOffer.findOne({ where: { id, userId } });
    if (!offer) {
      const e = new Error("Offre introuvable");
      e.status = 404;
      throw e;
    }
    return offer;
  },

  async update(userId, id, data) {
    const offer = await this.get(userId, id);

    const patch = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.company !== undefined) patch.company = data.company;
    if (data.sourceUrl !== undefined) patch.sourceUrl = data.sourceUrl;
    if (data.location !== undefined) patch.location = data.location;

    let reparse = false;
    if (
      data.description !== undefined &&
      data.description !== offer.description
    ) {
      patch.description = data.description;
      patch.parsingStatus = "pending";
      reparse = true;
    }

    await offer.update(patch);

    if (reparse) {
      this.parseInBackground(offer.id, data.description);
    }

    return offer;
  },

  async remove(userId, id) {
    const offer = await this.get(userId, id);
    await offer.destroy();
  },
};
