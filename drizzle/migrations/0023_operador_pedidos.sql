-- Papéis administrativos explícitos: operador_certidao NÃO é equipe.
CREATE OR REPLACE FUNCTION private.is_equipe(_user_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin'::public.app_role,'equipe'::public.app_role)) $$;

CREATE TABLE public.operador_pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  operador_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status_operacao text NOT NULL DEFAULT 'atribuido'
    CHECK (status_operacao IN ('atribuido','em_andamento','aguardando_tribunal','documento_recebido','concluido','devolvido')),
  atribuido_em timestamptz NOT NULL DEFAULT now(),
  atribuido_por uuid,
  iniciado_em timestamptz,
  concluido_em timestamptz,
  devolvido_em timestamptz,
  validado_em timestamptz,
  validado_por uuid,
  observacao_operador text,
  observacao_admin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Uma única atribuição ativa por pedido (ativa = não devolvida e não validada).
CREATE UNIQUE INDEX operador_pedidos_ativo_unico ON public.operador_pedidos (pedido_id)
  WHERE status_operacao <> 'devolvido' AND validado_em IS NULL;
CREATE INDEX operador_pedidos_operador_idx ON public.operador_pedidos (operador_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.operador_pedidos TO authenticated;
GRANT ALL ON public.operador_pedidos TO service_role;
ALTER TABLE public.operador_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe administra atribuicoes" ON public.operador_pedidos
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Operador le as proprias atribuicoes" ON public.operador_pedidos
  FOR SELECT TO authenticated
  USING (operador_id = auth.uid() AND private.has_role(auth.uid(), 'operador_certidao'::public.app_role));

CREATE TRIGGER operador_pedidos_set_updated_at BEFORE UPDATE ON public.operador_pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Destinatário precisa ter o papel de operador.
CREATE OR REPLACE FUNCTION public.validar_operador_pedido()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.operador_id AND role = 'operador_certidao') THEN
    RAISE EXCEPTION 'Usuário não é operador de certidão';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER operador_pedidos_validar BEFORE INSERT OR UPDATE OF operador_id ON public.operador_pedidos
  FOR EACH ROW EXECUTE FUNCTION public.validar_operador_pedido();

-- Helpers de acesso do operador (atribuição ativa ou concluída aguardando validação).
CREATE OR REPLACE FUNCTION private.operador_tem_pedido(_uid uuid, _pedido uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select private.has_role(_uid, 'operador_certidao'::public.app_role) and exists (
    select 1 from public.operador_pedidos o
    where o.pedido_id = _pedido and o.operador_id = _uid
      and o.status_operacao <> 'devolvido' and o.validado_em is null)
$$;
CREATE OR REPLACE FUNCTION private.operador_tem_protocolo(_uid uuid, _protocolo text)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select exists (select 1 from public.pedidos p where p.protocolo = _protocolo and private.operador_tem_pedido(_uid, p.id))
$$;

-- Anexos: operador só nos pedidos atribuídos.
CREATE POLICY "Operador le anexos atribuidos" ON public.pedido_anexos
  FOR SELECT TO authenticated USING (private.operador_tem_pedido(auth.uid(), pedido_id));
CREATE POLICY "Operador anexa em pedido atribuido" ON public.pedido_anexos
  FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid() AND private.operador_tem_pedido(auth.uid(), pedido_id));
CREATE POLICY "Operador le arquivos atribuidos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pedido-anexos' AND private.operador_tem_protocolo(auth.uid(), (storage.foldername(name))[1]));
CREATE POLICY "Operador envia arquivos atribuidos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pedido-anexos' AND private.operador_tem_protocolo(auth.uid(), (storage.foldername(name))[1]));

-- RPCs restritas do operador (sem SELECT geral em pedidos).
CREATE OR REPLACE FUNCTION public.operador_minha_fila()
 RETURNS TABLE (atribuicao_id uuid, pedido_id uuid, status_operacao text, atribuido_em timestamptz,
   iniciado_em timestamptz, concluido_em timestamptz, protocolo text, numero_processo text, nome_parte text,
   quantidade integer, tribunal_sigla text, uf_processo text, cidade_processo text, comarca_processo text,
   foro text, vara text, finalidade text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select o.id, p.id, o.status_operacao, o.atribuido_em, o.iniciado_em, o.concluido_em, p.protocolo,
    p.numero_processo, p.nome_parte, p.quantidade, p.tribunal_sigla, coalesce(p.uf_processo, p.uf),
    coalesce(p.cidade_processo, p.cidade), p.comarca_processo, p.foro, p.vara, p.finalidade
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.operador_id = auth.uid()
    and private.has_role(auth.uid(), 'operador_certidao'::public.app_role)
    and o.status_operacao <> 'devolvido' and o.validado_em is null
  order by o.atribuido_em asc
$$;

CREATE OR REPLACE FUNCTION public.operador_pedido_detalhe(p_atribuicao uuid)
 RETURNS TABLE (atribuicao_id uuid, pedido_id uuid, status_operacao text, atribuido_em timestamptz,
   iniciado_em timestamptz, concluido_em timestamptz, observacao_operador text, observacao_admin text,
   protocolo text, numero_processo text, nome_parte text, cpf text, quantidade integer, certidoes jsonb,
   observacoes text, finalidade text, tribunal_sigla text, tribunal_nome text, uf_processo text,
   cidade_processo text, comarca_processo text, foro text, vara text, unidade_judiciaria text,
   sistema_processual text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select o.id, p.id, o.status_operacao, o.atribuido_em, o.iniciado_em, o.concluido_em,
    o.observacao_operador, o.observacao_admin, p.protocolo, p.numero_processo, p.nome_parte, p.cpf,
    p.quantidade, p.certidoes, p.observacoes, p.finalidade, p.tribunal_sigla, p.tribunal_nome,
    coalesce(p.uf_processo, p.uf), coalesce(p.cidade_processo, p.cidade), p.comarca_processo, p.foro,
    p.vara, p.unidade_judiciaria, p.sistema_processual
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.id = p_atribuicao and o.operador_id = auth.uid()
    and private.operador_tem_pedido(auth.uid(), o.pedido_id)
$$;

CREATE OR REPLACE FUNCTION public.operador_historico(p_atribuicao uuid)
 RETURNS TABLE (id uuid, status text, observacao text, created_at timestamptz)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select a.id, a.status, a.observacao, a.created_at
  from public.pedido_andamentos a join public.operador_pedidos o on o.pedido_id = a.pedido_id
  where o.id = p_atribuicao and o.operador_id = auth.uid()
    and private.operador_tem_pedido(auth.uid(), o.pedido_id)
    and a.status like 'operacao_%'
  order by a.created_at desc
$$;

-- Operador muda SOMENTE a etapa operacional (nunca status comercial/pagamento).
CREATE OR REPLACE FUNCTION public.operador_atualizar_etapa(p_atribuicao uuid, p_status text, p_observacao text DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_status NOT IN ('atribuido','em_andamento','aguardando_tribunal','documento_recebido','concluido','devolvido') THEN
    RAISE EXCEPTION 'Etapa inválida';
  END IF;
  SELECT * INTO o FROM public.operador_pedidos WHERE id = p_atribuicao FOR UPDATE;
  IF o.id IS NULL OR o.operador_id <> auth.uid() OR NOT private.operador_tem_pedido(auth.uid(), o.pedido_id) THEN
    RAISE EXCEPTION 'Atribuição não encontrada';
  END IF;
  IF o.status_operacao = 'concluido' THEN
    RAISE EXCEPTION 'Atribuição concluída aguarda validação administrativa';
  END IF;
  UPDATE public.operador_pedidos SET
    status_operacao = p_status,
    observacao_operador = coalesce(nullif(trim(p_observacao), ''), observacao_operador),
    iniciado_em = CASE WHEN p_status <> 'atribuido' THEN coalesce(iniciado_em, now()) ELSE iniciado_em END,
    concluido_em = CASE WHEN p_status = 'concluido' THEN now() ELSE concluido_em END,
    devolvido_em = CASE WHEN p_status = 'devolvido' THEN now() ELSE devolvido_em END
  WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_' || p_status, nullif(trim(coalesce(p_observacao, '')), ''), auth.uid());
END $$;

CREATE OR REPLACE FUNCTION public.listar_operadores_certidao()
 RETURNS TABLE (id uuid, nome text, email text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select r.user_id, pr.nome, pr.email from public.user_roles r
  left join public.profiles pr on pr.id = r.user_id
  where r.role = 'operador_certidao' and private.is_staff(auth.uid())
  order by pr.nome
$$;

REVOKE ALL ON FUNCTION public.operador_minha_fila() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.operador_pedido_detalhe(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.operador_historico(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.operador_atualizar_etapa(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.listar_operadores_certidao() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validar_operador_pedido() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.operador_minha_fila() TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_pedido_detalhe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_historico(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_atualizar_etapa(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_operadores_certidao() TO authenticated;