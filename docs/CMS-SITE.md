# Editor do Site CAIC

O site público `caic.com.br` usa o Supabase do **SISTEMA CAIC** como CMS de conteúdo e mantém o código/layout no GitHub.

## Acesso

- Editor visual: `/admin/site.html`
- Login: mesma conta do Sistema CAIC
- Papéis autorizados: `admin`, `direcao` e `coordenacao`

## Recursos

- Pré-visualização ao vivo em desktop, tablet e celular
- Clique em seções da prévia para abrir o editor correspondente
- Rascunho separado da versão publicada
- Publicação instantânea do conteúdo sem commit no GitHub
- Histórico de versões com restauração para rascunho
- Agendamento de início/fim para conteúdos compatíveis
- Biblioteca de imagens no bucket `site-media`
- Upload de PDF, Word e Excel no bucket `site-files`
- Reordenação das principais seções por arrastar e soltar
- Edição de Hero, atalhos, avisos, notícias, galeria, documentos, horários, calendário/eventos, identidade da escola, menu, localização, rodapé e SEO
- Controle de enquadramento do banner principal

## Estrutura Supabase

- `cms_published_content`: conteúdo que o site público lê
- `cms_drafts`: rascunho do editor
- `cms_revisions`: histórico de publicações
- `site-media`: imagens públicas do site
- `site-files`: documentos públicos

As tabelas usam RLS. O conteúdo publicado pode ser lido publicamente; gravações e rascunhos exigem usuário autenticado com papel autorizado.

## IA para notícias

A interface do assistente está preparada e, sem API externa, consegue transformar anotações em um rascunho estruturado. A geração por modelo de IA deve ser ligada por uma Edge Function para manter a chave da API fora do navegador.
