const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');

const filePath = path.join(__dirname, '..' , 'views', 'image.ejs');

exports.renderImage = async (request, response, next) => {
    try {
        const { owner, repository } = request.params;
        const { singleLanguage, sharpProgress, borderRadius, styledProgress, customTitle, lightTheme} = request.query;

        const repositoryData = await getResponseFromGithub(`https://api.github.com/repos/${owner}/${repository}`);
        const languagesData = await getResponseFromGithub(`https://api.github.com/repos/${owner}/${repository}/languages`);

        const languagesPercentage = await calculateLanguagesPercentage(languagesData);

        const options = {
            full_name: repositoryData.full_name,
            homepage: repositoryData.homepage,
            name: repositoryData.name,
            topics: repositoryData.topics,
            description: repositoryData.description,
            stargazers_count: repositoryData.stargazers_count,
            subscribers_count: repositoryData.subscribers_count,
            open_issues: repositoryData.open_issues,
            forks: repositoryData.forks,
            language: repositoryData.language,
            languages: languagesPercentage,
            custom_title: customTitle,
            single_language: singleLanguage,
            sharp_progress: sharpProgress,
            styled_progress: styledProgress,
            border_radius: borderRadius,
            light_theme: lightTheme
        };

        const imageBuffer = await renderFromHTML(await ejs.renderFile(filePath, options));

        response.set("Content-Type", "image/png");
        response.set("Cache-Control", `public, max-age=3600, immutable`);
        response.locals.imageBuffer = imageBuffer;
        next();
    } catch (error) {
        console.error("Error in renderImage handler: ", error.message);
    }
};


async function getResponseFromGithub(url) {
    try {
        const responseFromGithub = await fetch(url, {method: 'GET', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer your_token}`}});
        return await responseFromGithub.json();
    } catch (error) {
        console.error("Error in getResponseFromGithub handler: ", error.message);
    }
}

async function renderFromHTML(html) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'load' });
            await page.evaluateHandle(async () => {
            await document.fonts.ready;
        });

        const content = await page.$("body");
        const imageBuffer = await content.screenshot({ omitBackground: true });

        await page.close();
        await browser.close();

        return imageBuffer;
    } catch (error) {
        console.error("Error in renderFromHTML handler: ", error.message);
    }
}

async function calculateLanguagesPercentage(repositoryLanguages) {
    try {
        const languagesSum = Object.values(repositoryLanguages).reduce((acc, current) => acc + current, 0);
        const languagesData = {};
        for (const [language, value] of Object.entries(repositoryLanguages)) {
            const percentage = ((value / languagesSum) * 100).toFixed(1);
            languagesData[language] = percentage;
        }
        return languagesData;
    } catch (error) {
        console.error("Error in calculateLanguagesPercentage handler: ", error.message);
    }
}