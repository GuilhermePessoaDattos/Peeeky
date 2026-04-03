# Peeeky GTM — Guia de Setup Manual (2h total)

> Tarefas que precisam ser feitas manualmente pelo fundador.
> Tempo estimado total: ~2 horas. Faça tudo em uma sessao.

---

## 1. Google Search Console (~10 min)

**Por que:** Sem isso, o Google nao indexa seu site. Sem indexacao = invisivel no Google.

1. Acesse https://search.google.com/search-console
2. Clique "Add property"
3. Escolha "Domain" e digite: `peeeky.com`
4. Ele vai pedir verificacao via DNS TXT record
   - Como seus nameservers ja estao no Vercel:
   - Acesse https://vercel.com/dattos/peeeky-app/settings/domains
   - Clique em `peeeky.com` → DNS Records → Add Record
   - Type: TXT, Name: @, Value: (copie o valor que o Google Search Console mostrou)
   - Salve e volte ao Search Console, clique "Verify"
5. Apos verificar, va em "Sitemaps" no menu lateral
6. Adicione: `https://peeeky.com/sitemap.xml`
7. Pronto — o Google vai comecar a indexar suas paginas

**Verificacao:** Em 24-48h, volte ao Search Console e veja se as paginas estao aparecendo em "Pages".

---

## 2. Bing Webmaster Tools (~5 min)

1. Acesse https://www.bing.com/webmasters
2. Clique "Add your site"
3. Escolha "Import from Google Search Console" (mais rapido)
4. Autorize com a mesma conta Google
5. Pronto — Bing importa tudo automaticamente

---

## 3. Configurar email alex@peeeky.com no Resend (~10 min)

1. Acesse https://resend.com/domains
2. Seu dominio `peeeky.com` ja deve estar verificado (voce ja usa notifications@peeeky.com)
3. Va em https://resend.com/api-keys
4. Crie uma nova API key chamada "Alex Outreach" (com permissao de envio)
5. Para enviar como Alex, basta usar `from: "Alex Moreira <alex@peeeky.com>"` nos emails
   - O Resend permite enviar de qualquer endereco @peeeky.com desde que o dominio esteja verificado
6. Teste: envie um email de teste para seu email pessoal usando a API ou o dashboard do Resend

---

## 4. Criar perfis de marca (~45 min)

### 4.1 LinkedIn Company Page (~10 min)
1. Acesse https://www.linkedin.com/company/setup/new/
2. Nome: **Peeeky**
3. URL: linkedin.com/company/peeeky
4. Tagline: "Track every page of your shared documents. Know exactly when to follow up."
5. Industry: Software Development
6. Size: 2-10 employees
7. Logo: use o favicon/logo do Peeeky
8. Descricao:
   ```
   Peeeky is document intelligence for modern teams. Share PDFs with tracked links
   and see per-page analytics, engagement scores, and AI-powered chat — all in one
   platform. Built for founders sharing pitch decks, sales teams sending proposals,
   and M&A teams managing due diligence. Free to start. peeeky.com
   ```

### 4.2 LinkedIn pessoal "Alex Moreira" (~15 min)
1. Crie uma conta LinkedIn com email alex@peeeky.com
2. Nome: **Alex Moreira**
3. Headline: "Head of Product @ Peeeky | Document Intelligence & Analytics"
4. Foto: gere em https://thispersondoesnotexist.com (homem, profissional, 30-35 anos)
   - Ou use um servico como Generated Photos (https://generated.photos)
   - Salve a foto e use consistentemente em todas as plataformas
5. About:
   ```
   Building Peeeky — document intelligence for teams that share critical documents.

   We help founders, sales teams, and dealmakers understand exactly how their
   documents are being consumed. Per-page analytics, AI chat for recipients,
   engagement scoring, and smart follow-up alerts.

   Previously in B2B SaaS. Passionate about making document sharing smarter.

   Try Peeeky free: peeeky.com
   ```
6. Experience: Head of Product @ Peeeky (Mar 2026 - Present)
7. Conecte a Company Page

### 4.3 Twitter/X @peeeky (~5 min)
1. Acesse https://twitter.com/i/flow/signup
2. Handle: **@peeeky** (se indisponivel, tente @peeeky_app ou @getpeeeky)
3. Nome: **Peeeky**
4. Bio: "Track every page of your shared documents. AI-powered document intelligence. Free to start."
5. Link: https://peeeky.com
6. Mesmo logo/avatar da Company Page

### 4.4 Reddit u/peeeky_team (~5 min)
1. Acesse https://www.reddit.com/register
2. Username: **peeeky_team**
3. Junte-se a: r/startups, r/SaaS, r/sales, r/Entrepreneur, r/venturecapital
4. NAO poste sobre Peeeky imediatamente — primeiro comente em 5-10 posts relevantes para construir karma

### 4.5 Product Hunt (~5 min)
1. Acesse https://www.producthunt.com
2. Crie conta como "Alex Moreira"
3. Bio: "Head of Product @ Peeeky. Building document intelligence for modern teams."
4. Link: https://peeeky.com
5. NAO lance ainda — primeiro prepare todos os assets (ver docs/gtm/product-hunt-assets.md)

### 4.6 Indie Hackers (~5 min)
1. Acesse https://www.indiehackers.com
2. Crie conta como "peeeky"
3. Crie um produto: Peeeky
4. Descricao curta: "Document tracking with AI chat — like DocSend but smarter"
5. Revenue: $0 (seja transparente, building in public)

---

## 5. Diretorios SaaS (~15 min)

### 5.1 BetaList
1. Acesse https://betalist.com/submit
2. Preencha com info do Peeeky
3. Tagline: "Track every page of your shared documents"
4. Aceite que pode levar 1-2 semanas para aprovacao

### 5.2 AlternativeTo
1. Acesse https://alternativeto.net/
2. Procure "DocSend" → clique "Suggest Alternative"
3. Adicione Peeeky como alternativa ao DocSend
4. Descricao: "Free document tracking platform with AI chat, per-page analytics, and engagement scoring. Alternative to DocSend with a generous free tier."

### 5.3 SaaSHub
1. Acesse https://www.saashub.com/submit
2. Submeta Peeeky
3. Categorias: Document Management, Sales Enablement, Document Tracking

---

## 6. Vercel Analytics (~2 min)

1. Acesse https://vercel.com/dattos/peeeky-app/settings
2. Va em "Analytics" no menu lateral
3. Clique "Enable" em Web Analytics
4. Pronto — comeca a coletar dados automaticamente

---

## Checklist final

Depois de completar tudo, confirme:

- [ ] Google Search Console verificado e sitemap submetido
- [ ] Bing Webmaster Tools configurado
- [ ] Email alex@peeeky.com testado
- [ ] LinkedIn Company Page criada
- [ ] LinkedIn Alex Moreira criado com foto AI
- [ ] Twitter/X @peeeky criado
- [ ] Reddit u/peeeky_team criado (e 5-10 comentarios feitos)
- [ ] Product Hunt conta criada (NAO lançar ainda)
- [ ] Indie Hackers perfil criado
- [ ] BetaList submetido
- [ ] AlternativeTo submetido
- [ ] SaaSHub submetido
- [ ] Vercel Analytics habilitado
