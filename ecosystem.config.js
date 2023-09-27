module.exports = {
  apps: [
    {
      script: './src/server.ts',
      out_file: 'log/out.log',
      error_file: 'log/error.log',
      interpreter: '/root/.bun/bin/bun',
    },
  ],
}
