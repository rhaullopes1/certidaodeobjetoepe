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

-- TJSP: página oficial específica de Certidão de Objeto e Pé (verificada 2026-09-28)
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjsp.jus.br/Certidoes/Certidoes/Paginas_Default?c=12', certidoes_tipo='objeto_pe_via_unidade', certidoes_fonte='Site oficial do TJSP — Certidões: Certidão de Objeto e Pé', certidoes_verificada_em='2026-09-28', certidoes_instrucoes='Segundo o TJSP, a Certidão de Objeto e Pé é solicitada presencialmente ou pelo Balcão Virtual da unidade em que tramita ou tramitou o processo; a retirada é presencial na unidade emissora (vara competente).' WHERE sigla='TJSP';

-- Rodada 2026-09-28: canais gerais dos demais tribunais presentes nos pedidos.
-- Todas as URLs estão em domínio .jus.br do próprio tribunal. Tipo 'geral' = página de
-- certidões do tribunal, NÃO página específica de Certidão de Objeto e Pé.
UPDATE public.cnj_tribunais SET certidoes_url='https://sistemas.trf1.jus.br/certidao/', certidoes_tipo='geral', certidoes_fonte='Site oficial TRF1 — Certidões Negativas da 1ª Região (sistemas.trf1.jus.br)', certidoes_verificada_em='2026-09-28', certidoes_instrucoes='Este sistema emite certidões negativas da 1ª Região. A Certidão de Objeto e Pé deve ser solicitada à unidade/vara onde tramita o processo, pelo Balcão Virtual ou atendimento da subseção.' WHERE sigla='TRF1';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.trf1.jus.br/trf1/carta-servicos/balcao-virtual', balcao_virtual_fonte='Site oficial TRF1 — Carta de Serviços: Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TRF1';

UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjrs.jus.br/novo/processos-e-servicos/servicos-processuais/emissao-de-antecedentes-e-certidoes/', certidoes_tipo='geral', certidoes_fonte='Site oficial TJRS — Emissão de Antecedentes e Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJRS';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.tjrs.jus.br/novo/processos-e-servicos/servicos-processuais/balcao-virtual/', balcao_virtual_fonte='Site oficial TJRS — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJRS';

UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjmg.jus.br/portal-tjmg/processos/certidao-judicial/', certidoes_tipo='geral', certidoes_fonte='Portal oficial TJMG — Certidão Judicial', certidoes_verificada_em='2026-09-28' WHERE sigla='TJMG';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.tjmg.jus.br/portal-tjmg/processos/balcao-virtual/', balcao_virtual_fonte='Portal oficial TJMG — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJMG';

UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjpr.jus.br/certidoes', certidoes_tipo='geral', certidoes_fonte='Site oficial TJPR — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJPR';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://balcaovirtual.tjpr.jus.br/', balcao_virtual_fonte='Site oficial TJPR — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJPR';

UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjgo.jus.br/index.php/processos/emissao-de-certidoes', certidoes_tipo='geral', certidoes_fonte='Site oficial TJGO — Emissão de Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJGO';
UPDATE public.cnj_tribunais SET balcao_virtual_url='https://www.tjgo.jus.br/index.php/bc-virtual', balcao_virtual_fonte='Site oficial TJGO — Balcão Virtual', balcao_virtual_verificada_em='2026-09-28' WHERE sigla='TJGO';

UPDATE public.cnj_tribunais SET certidoes_url='https://www3.tjrj.jus.br/CJE/certidao/judicial/', certidoes_tipo='geral', certidoes_fonte='Site oficial TJRJ — Certidão Judicial Eletrônica (CJE)', certidoes_verificada_em='2026-09-28' WHERE sigla='TJRJ';
UPDATE public.cnj_tribunais SET certidoes_url='https://portal.tjpe.jus.br/certidoes', certidoes_tipo='geral', certidoes_fonte='Portal oficial TJPE — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJPE';
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjes.jus.br/certidao-negativa-2/', certidoes_tipo='geral', certidoes_fonte='Site oficial TJES — Certidão Negativa', certidoes_verificada_em='2026-09-28' WHERE sigla='TJES';
UPDATE public.cnj_tribunais SET certidoes_url='https://www5.tjms.jus.br/servicos/certidoes/', certidoes_tipo='geral', certidoes_fonte='Site oficial TJMS — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJMS';
UPDATE public.cnj_tribunais SET certidoes_url='https://europa.tjpi.jus.br/certidao', certidoes_tipo='geral', certidoes_fonte='Site oficial TJPI — Certidões Judiciais Públicas', certidoes_verificada_em='2026-09-28' WHERE sigla='TJPI';
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjrn.jus.br/certidoes/', certidoes_tipo='geral', certidoes_fonte='Site oficial TJRN — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJRN';
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjto.jus.br/suporte-e-proc/certidoes', certidoes_tipo='geral', certidoes_fonte='Site oficial TJTO — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJTO';
UPDATE public.cnj_tribunais SET certidoes_url='https://ww2.trt2.jus.br/servicos/certidoes', certidoes_tipo='geral', certidoes_fonte='Site oficial TRT da 2ª Região — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TRT2';
UPDATE public.cnj_tribunais SET certidoes_url='https://www.trt9.jus.br/certidao', certidoes_tipo='geral', certidoes_fonte='Site oficial TRT da 9ª Região — Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TRT9';
UPDATE public.cnj_tribunais SET certidoes_url='https://certidoes.tjac.jus.br/', certidoes_tipo='geral', certidoes_fonte='Site oficial TJAC — Consulta de Certidões', certidoes_verificada_em='2026-09-28' WHERE sigla='TJAC';
UPDATE public.cnj_tribunais SET certidoes_url='https://www.tjpb.jus.br/servicos/solicitar-certidao', certidoes_tipo='geral', certidoes_fonte='Site oficial TJPB — Solicitar Certidão', certidoes_verificada_em='2026-09-28' WHERE sigla='TJPB';
