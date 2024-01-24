module.exports = {
  locales: ['en', 'es'],
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
  formatOptions: {
    origins: true,
    lineNumbers: false,
  },
  orderBy: 'messageId',
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
};
