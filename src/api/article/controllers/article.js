"use strict";

/**
 * article controller
 */

const handleHashtags = async (hashtagsArr, strapi) => {
	const receivedHashtags = [...hashtagsArr];

	const findOrCreateHashtagIdList = [];

	for (const tag of receivedHashtags) {
		if (typeof tag !== "string") {
			break;
		}
		const foundTag = await strapi.db
			.query("api::article-hashtag.article-hashtag")
			.findOne({
				where: {
					tag: tag,
				},
			});

		// console.log("foundTag", foundTag);

		if (foundTag?.id) {
			findOrCreateHashtagIdList.push(foundTag.id);
			continue;
		}

		if (!foundTag) {
			const createdTag = await strapi.entityService.create(
				"api::article-hashtag.article-hashtag",
				{
					data: {
						tag: tag,
						publishedAt: new Date(),
					},
				}
			);
			findOrCreateHashtagIdList.push(createdTag.id);
			continue;
		}
	}

	// console.log("findOrCreateHashtagIdList", findOrCreateHashtagIdList);

	return findOrCreateHashtagIdList;
};

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::article.article", ({ strapi }) => ({
	async update(ctx) {
		// console.log("updatedReqBody", ctx.request.body);
		const hashtags = ctx.request.body?.data?.article_hashtags;
		if (hashtags?.length > 0) {
			if (ctx.request.body?.data?.article_hashtags) {
				ctx.request.body.data.article_hashtags = await handleHashtags(
					hashtags,
					strapi
				);
			}
		}

		const response = await super.update(ctx);
		return response;
	},
	async create(ctx) {
		const hashtags = ctx.request.body?.data?.article_hashtags;
		if (hashtags?.length > 0) {
			if (ctx.request.body?.data?.article_hashtags) {
				ctx.request.body.data.article_hashtags = await handleHashtags(
					hashtags,
					strapi
				);
			}
		}

		const response = await super.create(ctx);
		return response;
	},
}));
