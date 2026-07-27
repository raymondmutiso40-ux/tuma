module.exports = {
  apps: [
    {
      name: "tuma",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        DB_HOST: "localhost",
        DB_PORT: "3306",
        DB_USER: "tuma_user",
        DB_PASSWORD: "changeme",
        DB_NAME: "tuma_db",
      },
    },
  ],
};
