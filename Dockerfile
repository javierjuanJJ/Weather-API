FROM node:20-alpine

WORKDIR /app

COPY weather-api/backend/package.json weather-api/backend/package-lock.json ./
RUN npm ci --omit=dev

COPY weather-api/backend/ ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/weather?city=e').then(r=>{process.exit(r.status<500?0:1)}).catch(()=>process.exit(1))" || exit 1

CMD ["node", "app.js"]