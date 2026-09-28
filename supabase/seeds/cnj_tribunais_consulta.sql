-- Links oficiais de consulta processual (domínios .jus.br dos próprios tribunais), verificados com HTTP 200 em 2026-09-28.
-- Só preenche quando o campo está vazio (não substitui cadastro manual).
UPDATE public.cnj_tribunais t SET consulta_processual_url = v.url,
  consulta_processual_fonte = 'Site oficial do tribunal (' || v.url || ')',
  consulta_processual_verificada_em = DATE '2026-09-28'
FROM (VALUES
('TJSP','https://esaj.tjsp.jus.br/cpopg/open.do'),
('TJAC','https://esaj.tjac.jus.br/cpopg/open.do'),
('TJRJ','https://www3.tjrj.jus.br/consultaprocessual/'),
('TJBA','https://consultapublicapje.tjba.jus.br/pje/ConsultaPublica/listView.seam'),
('TJGO','https://projudi.tjgo.jus.br/BuscaProcesso'),
('TJPB','https://consultapublica.tjpb.jus.br/pje/ConsultaPublica/listView.seam'),
('TJDF','https://pje-consultapublica.tjdft.jus.br/consultapublica/ConsultaPublica/listView.seam')
) AS v(sigla,url)
WHERE t.sigla = v.sigla AND t.consulta_processual_url IS NULL;
