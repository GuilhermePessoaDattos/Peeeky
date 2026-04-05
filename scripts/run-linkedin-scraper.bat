@echo off
cd /d "c:\Users\guilh\OneDrive\Área de Trabalho\claude\projetos\MicroSaaS"
set PEEEKY_API_URL=https://peeeky.com
set CRON_SECRET=jGFmB8ZVLqBLQ_e71PJXwy0om14lPVsAfO-frOKSUyw

echo LinkedIn Lead Scraper
echo =====================
echo.

if "%1"=="" (
  set QUERY=CEO founder recently raised seed
) else (
  set QUERY=%*
)

echo Query: %QUERY%
echo.

npx tsx scripts/linkedin-lead-scraper.ts --query "%QUERY%" --limit 5
pause
