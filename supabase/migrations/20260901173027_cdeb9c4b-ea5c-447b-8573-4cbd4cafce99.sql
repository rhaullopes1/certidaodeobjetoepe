CREATE TABLE public.cnj_segmentos (
  codigo smallint PRIMARY KEY,
  nome text NOT NULL,
  descricao text
);
GRANT SELECT ON public.cnj_segmentos TO anon, authenticated;
GRANT ALL ON public.cnj_segmentos TO service_role;
ALTER TABLE public.cnj_segmentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Segmentos CNJ sao publicos" ON public.cnj_segmentos FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.cnj_segmentos (codigo, nome, descricao) VALUES
  (1,'Supremo Tribunal Federal','Processos originários e recursais do STF'),
  (2,'Conselho Nacional de Justiça','Procedimentos administrativos do CNJ'),
  (3,'Superior Tribunal de Justiça','Processos do STJ'),
  (4,'Justiça Federal','Tribunais Regionais Federais e seções judiciárias'),
  (5,'Justiça do Trabalho','TST e Tribunais Regionais do Trabalho'),
  (6,'Justiça Eleitoral','TSE e Tribunais Regionais Eleitorais'),
  (7,'Justiça Militar da União','Superior Tribunal Militar e auditorias militares'),
  (8,'Justiça Estadual','Tribunais de Justiça dos estados e do Distrito Federal'),
  (9,'Justiça Militar Estadual','Tribunais de Justiça Militar estaduais');

CREATE TABLE public.cnj_tribunais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segmento smallint NOT NULL REFERENCES public.cnj_segmentos(codigo),
  codigo_tr text NOT NULL,
  sigla text NOT NULL,
  nome text NOT NULL,
  uf text,
  sede text,
  sistema text,
  tipo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (segmento, codigo_tr)
);
GRANT SELECT ON public.cnj_tribunais TO anon, authenticated;
GRANT ALL ON public.cnj_tribunais TO service_role;
ALTER TABLE public.cnj_tribunais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tribunais CNJ sao publicos" ON public.cnj_tribunais FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER cnj_tribunais_set_updated_at BEFORE UPDATE ON public.cnj_tribunais FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cnj_tribunais (segmento, codigo_tr, sigla, nome, uf, sede, sistema, tipo) VALUES
(1,'00','STF','Supremo Tribunal Federal',NULL,'Brasília','STF Digital','superior'),
  (2,'00','CNJ','Conselho Nacional de Justiça',NULL,'Brasília','PJe','superior'),
  (3,'00','STJ','Superior Tribunal de Justiça',NULL,'Brasília','e-STJ','superior'),
  (4,'01','TRF1','Tribunal Regional Federal da 1ª Região',NULL,'Brasília','PJe','federal'),
  (4,'02','TRF2','Tribunal Regional Federal da 2ª Região',NULL,'Rio de Janeiro','PJe','federal'),
  (4,'03','TRF3','Tribunal Regional Federal da 3ª Região',NULL,'São Paulo','PJe','federal'),
  (4,'04','TRF4','Tribunal Regional Federal da 4ª Região',NULL,'Porto Alegre','PJe','federal'),
  (4,'05','TRF5','Tribunal Regional Federal da 5ª Região',NULL,'Recife','PJe','federal'),
  (4,'06','TRF6','Tribunal Regional Federal da 6ª Região',NULL,'Belo Horizonte','PJe','federal'),
  (5,'00','TST','Tribunal Superior do Trabalho',NULL,'Brasília','PJe','superior'),
  (5,'01','TRT1','Tribunal Regional do Trabalho da 1ª Região','RJ','Rio de Janeiro','PJe','trabalhista'),
  (5,'02','TRT2','Tribunal Regional do Trabalho da 2ª Região','SP','São Paulo','PJe','trabalhista'),
  (5,'03','TRT3','Tribunal Regional do Trabalho da 3ª Região','MG','Belo Horizonte','PJe','trabalhista'),
  (5,'04','TRT4','Tribunal Regional do Trabalho da 4ª Região','RS','Porto Alegre','PJe','trabalhista'),
  (5,'05','TRT5','Tribunal Regional do Trabalho da 5ª Região','BA','Salvador','PJe','trabalhista'),
  (5,'06','TRT6','Tribunal Regional do Trabalho da 6ª Região','PE','Recife','PJe','trabalhista'),
  (5,'07','TRT7','Tribunal Regional do Trabalho da 7ª Região','CE','Fortaleza','PJe','trabalhista'),
  (5,'08','TRT8','Tribunal Regional do Trabalho da 8ª Região','PA','Belém','PJe','trabalhista'),
  (5,'09','TRT9','Tribunal Regional do Trabalho da 9ª Região','PR','Curitiba','PJe','trabalhista'),
  (5,'10','TRT10','Tribunal Regional do Trabalho da 10ª Região','DF','Brasília','PJe','trabalhista'),
  (5,'11','TRT11','Tribunal Regional do Trabalho da 11ª Região','AM','Manaus','PJe','trabalhista'),
  (5,'12','TRT12','Tribunal Regional do Trabalho da 12ª Região','SC','Florianópolis','PJe','trabalhista'),
  (5,'13','TRT13','Tribunal Regional do Trabalho da 13ª Região','PB','João Pessoa','PJe','trabalhista'),
  (5,'14','TRT14','Tribunal Regional do Trabalho da 14ª Região','RO','Porto Velho','PJe','trabalhista'),
  (5,'15','TRT15','Tribunal Regional do Trabalho da 15ª Região','SP','Campinas','PJe','trabalhista'),
  (5,'16','TRT16','Tribunal Regional do Trabalho da 16ª Região','MA','São Luís','PJe','trabalhista'),
  (5,'17','TRT17','Tribunal Regional do Trabalho da 17ª Região','ES','Vitória','PJe','trabalhista'),
  (5,'18','TRT18','Tribunal Regional do Trabalho da 18ª Região','GO','Goiânia','PJe','trabalhista'),
  (5,'19','TRT19','Tribunal Regional do Trabalho da 19ª Região','AL','Maceió','PJe','trabalhista'),
  (5,'20','TRT20','Tribunal Regional do Trabalho da 20ª Região','SE','Aracaju','PJe','trabalhista'),
  (5,'21','TRT21','Tribunal Regional do Trabalho da 21ª Região','RN','Natal','PJe','trabalhista'),
  (5,'22','TRT22','Tribunal Regional do Trabalho da 22ª Região','PI','Teresina','PJe','trabalhista'),
  (5,'23','TRT23','Tribunal Regional do Trabalho da 23ª Região','MT','Cuiabá','PJe','trabalhista'),
  (5,'24','TRT24','Tribunal Regional do Trabalho da 24ª Região','MS','Campo Grande','PJe','trabalhista'),
  (6,'00','TSE','Tribunal Superior Eleitoral',NULL,'Brasília','PJe','superior'),
  (6,'01','TRE-AC','Tribunal Regional Eleitoral do Acre','AC','Rio Branco','PJe','eleitoral'),
  (6,'02','TRE-AL','Tribunal Regional Eleitoral de Alagoas','AL','Maceió','PJe','eleitoral'),
  (6,'03','TRE-AP','Tribunal Regional Eleitoral do Amapá','AP','Macapá','PJe','eleitoral'),
  (6,'04','TRE-AM','Tribunal Regional Eleitoral do Amazonas','AM','Manaus','PJe','eleitoral'),
  (6,'05','TRE-BA','Tribunal Regional Eleitoral da Bahia','BA','Salvador','PJe','eleitoral'),
  (6,'06','TRE-CE','Tribunal Regional Eleitoral do Ceará','CE','Fortaleza','PJe','eleitoral'),
  (6,'07','TRE-DF','Tribunal Regional Eleitoral do Distrito Federal e dos Territórios','DF','Brasília','PJe','eleitoral'),
  (6,'08','TRE-ES','Tribunal Regional Eleitoral do Espírito Santo','ES','Vitória','PJe','eleitoral'),
  (6,'09','TRE-GO','Tribunal Regional Eleitoral de Goiás','GO','Goiânia','PJe','eleitoral'),
  (6,'10','TRE-MA','Tribunal Regional Eleitoral do Maranhão','MA','São Luís','PJe','eleitoral'),
  (6,'11','TRE-MT','Tribunal Regional Eleitoral de Mato Grosso','MT','Cuiabá','PJe','eleitoral'),
  (6,'12','TRE-MS','Tribunal Regional Eleitoral de Mato Grosso do Sul','MS','Campo Grande','PJe','eleitoral'),
  (6,'13','TRE-MG','Tribunal Regional Eleitoral de Minas Gerais','MG','Belo Horizonte','PJe','eleitoral'),
  (6,'14','TRE-PA','Tribunal Regional Eleitoral do Pará','PA','Belém','PJe','eleitoral'),
  (6,'15','TRE-PB','Tribunal Regional Eleitoral da Paraíba','PB','João Pessoa','PJe','eleitoral'),
  (6,'16','TRE-PR','Tribunal Regional Eleitoral do Paraná','PR','Curitiba','PJe','eleitoral'),
  (6,'17','TRE-PE','Tribunal Regional Eleitoral de Pernambuco','PE','Recife','PJe','eleitoral'),
  (6,'18','TRE-PI','Tribunal Regional Eleitoral do Piauí','PI','Teresina','PJe','eleitoral'),
  (6,'19','TRE-RJ','Tribunal Regional Eleitoral do Rio de Janeiro','RJ','Rio de Janeiro','PJe','eleitoral'),
  (6,'20','TRE-RN','Tribunal Regional Eleitoral do Rio Grande do Norte','RN','Natal','PJe','eleitoral'),
  (6,'21','TRE-RS','Tribunal Regional Eleitoral do Rio Grande do Sul','RS','Porto Alegre','PJe','eleitoral'),
  (6,'22','TRE-RO','Tribunal Regional Eleitoral de Rondônia','RO','Porto Velho','PJe','eleitoral'),
  (6,'23','TRE-RR','Tribunal Regional Eleitoral de Roraima','RR','Boa Vista','PJe','eleitoral'),
  (6,'24','TRE-SC','Tribunal Regional Eleitoral de Santa Catarina','SC','Florianópolis','PJe','eleitoral'),
  (6,'25','TRE-SE','Tribunal Regional Eleitoral de Sergipe','SE','Aracaju','PJe','eleitoral'),
  (6,'26','TRE-SP','Tribunal Regional Eleitoral de São Paulo','SP','São Paulo','PJe','eleitoral'),
  (6,'27','TRE-TO','Tribunal Regional Eleitoral do Tocantins','TO','Palmas','PJe','eleitoral'),
  (7,'00','STM','Superior Tribunal Militar',NULL,'Brasília','e-Proc/STM','superior'),
  (8,'01','TJAC','Tribunal de Justiça do Acre','AC','Rio Branco','e-SAJ','estadual'),
  (8,'02','TJAL','Tribunal de Justiça de Alagoas','AL','Maceió','PJe','estadual'),
  (8,'03','TJAP','Tribunal de Justiça do Amapá','AP','Macapá','PJe','estadual'),
  (8,'04','TJAM','Tribunal de Justiça do Amazonas','AM','Manaus','PJe','estadual'),
  (8,'05','TJBA','Tribunal de Justiça da Bahia','BA','Salvador','PJe','estadual'),
  (8,'06','TJCE','Tribunal de Justiça do Ceará','CE','Fortaleza','PJe','estadual'),
  (8,'07','TJDF','Tribunal de Justiça do Distrito Federal e dos Territórios','DF','Brasília','PJe','estadual'),
  (8,'08','TJES','Tribunal de Justiça do Espírito Santo','ES','Vitória','PJe','estadual'),
  (8,'09','TJGO','Tribunal de Justiça de Goiás','GO','Goiânia','PROJUDI','estadual'),
  (8,'10','TJMA','Tribunal de Justiça do Maranhão','MA','São Luís','PJe','estadual'),
  (8,'11','TJMT','Tribunal de Justiça de Mato Grosso','MT','Cuiabá','PJe','estadual'),
  (8,'12','TJMS','Tribunal de Justiça de Mato Grosso do Sul','MS','Campo Grande','PJe','estadual'),
  (8,'13','TJMG','Tribunal de Justiça de Minas Gerais','MG','Belo Horizonte','PJe','estadual'),
  (8,'14','TJPA','Tribunal de Justiça do Pará','PA','Belém','PJe','estadual'),
  (8,'15','TJPB','Tribunal de Justiça da Paraíba','PB','João Pessoa','PJe','estadual'),
  (8,'16','TJPR','Tribunal de Justiça do Paraná','PR','Curitiba','PROJUDI e PJe','estadual'),
  (8,'17','TJPE','Tribunal de Justiça de Pernambuco','PE','Recife','PJe','estadual'),
  (8,'18','TJPI','Tribunal de Justiça do Piauí','PI','Teresina','PJe','estadual'),
  (8,'19','TJRJ','Tribunal de Justiça do Rio de Janeiro','RJ','Rio de Janeiro','PJe e Portal de Serviços','estadual'),
  (8,'20','TJRN','Tribunal de Justiça do Rio Grande do Norte','RN','Natal','PJe','estadual'),
  (8,'21','TJRS','Tribunal de Justiça do Rio Grande do Sul','RS','Porto Alegre','eproc','estadual'),
  (8,'22','TJRO','Tribunal de Justiça de Rondônia','RO','Porto Velho','PJe','estadual'),
  (8,'23','TJRR','Tribunal de Justiça de Roraima','RR','Boa Vista','PROJUDI','estadual'),
  (8,'24','TJSC','Tribunal de Justiça de Santa Catarina','SC','Florianópolis','eproc','estadual'),
  (8,'25','TJSE','Tribunal de Justiça de Sergipe','SE','Aracaju','PJe','estadual'),
  (8,'26','TJSP','Tribunal de Justiça de São Paulo','SP','São Paulo','e-SAJ','estadual'),
  (8,'27','TJTO','Tribunal de Justiça do Tocantins','TO','Palmas','e-Proc','estadual'),
  (9,'13','TJMMG','Tribunal de Justiça Militar de Minas Gerais','MG','Belo Horizonte','e-Proc','militar_estadual'),
  (9,'21','TJMRS','Tribunal de Justiça Militar do Rio Grande do Sul','RS','Porto Alegre','e-Proc','militar_estadual'),
  (9,'26','TJMSP','Tribunal de Justiça Militar de São Paulo','SP','São Paulo','e-Proc','militar_estadual')
;

CREATE TABLE public.cnj_comarcas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribunal_id uuid NOT NULL REFERENCES public.cnj_tribunais(id) ON DELETE CASCADE,
  codigo_origem text NOT NULL,
  nome text NOT NULL,
  cidade text,
  uf text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tribunal_id, codigo_origem)
);
CREATE INDEX cnj_comarcas_codigo_idx ON public.cnj_comarcas (codigo_origem);
GRANT SELECT ON public.cnj_comarcas TO anon, authenticated;
GRANT ALL ON public.cnj_comarcas TO service_role;
ALTER TABLE public.cnj_comarcas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comarcas CNJ sao publicas" ON public.cnj_comarcas FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER cnj_comarcas_set_updated_at BEFORE UPDATE ON public.cnj_comarcas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cnj_comarcas (tribunal_id, codigo_origem, nome, cidade, uf)
SELECT t.id, '0100', 'Foro Central Cível da Comarca de São Paulo', 'São Paulo', 'SP'
FROM public.cnj_tribunais t WHERE t.segmento = 8 AND t.codigo_tr = '26';