/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ai-tools-nav-two.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Baiduspider', allow: '/' },
    ],
    additionalSitemaps: [
      'https://ai-tools-nav-two.vercel.app/sitemap.xml',
    ],
  },
}
