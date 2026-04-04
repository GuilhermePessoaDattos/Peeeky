@echo off
cd /d "c:\Users\guilh\OneDrive\Área de Trabalho\claude\projetos\MicroSaaS"
set PEEEKY_API_URL=https://peeeky.com
set CRON_SECRET=REPLACE_WITH_YOUR_SECRET
npx tsx scripts/social-publisher.ts >> logs\social-publisher.log 2>&1
