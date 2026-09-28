-- Canais gerais oficiais dos tribunais (verificados em 28/09/2026, HTTP 200 no domínio do próprio tribunal).
-- Idempotente: apenas UPDATE por sigla.
UPDATE public.cnj_tribunais SET consulta_processual_url='https://esaj.tjsp.jus.br/esaj?servico=190090',
  consulta_processual_fonte='Portal e-SAJ TJSP — Consultas Processuais', consulta_processual_verificada_em='2026-09-28'
  WHERE sigla='TJSP' AND tipo IS NOT NULL;
UPDATE public.cnj_tribunais SET consulta_processual_url='https://consulta.tjmg.jus.br/pesquisa',
  consulta_processual_fonte='TJMG — Consulta Processual (consulta.tjmg.jus.br)', consulta_processual_verificada_em='2026-09-28'
  WHERE sigla='TJMG';

UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.tjsp.jus.br/balcaovirtual', balcao_virtual_fonte='tjsp.jus.br — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJSP';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.tjrj.jus.br/web/guest/balcao-virtual', balcao_virtual_fonte='tjrj.jus.br — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJRJ';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://tjba.jus.br/balcaovirtual/', balcao_virtual_fonte='tjba.jus.br — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJBA';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://portal.tjpe.jus.br/balcao-virtual/atendimento', balcao_virtual_fonte='portal.tjpe.jus.br — Balcão Virtual / Atendimento', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJPE';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.tjpb.jus.br/balcao-virtual', balcao_virtual_fonte='tjpb.jus.br — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJPB';

-- Certidões: páginas gerais (não são páginas exclusivas de Objeto e Pé).
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjsp.jus.br/Certidoes', certidoes_tipo='geral', certidoes_fonte='tjsp.jus.br — Certidões (e-SAJ / eproc)', certidoes_verificada_em='2026-09-28' WHERE sigla='TJSP';
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjdft.jus.br/servicos/certidoes', certidoes_tipo='geral', certidoes_fonte='tjdft.jus.br — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJDF';
