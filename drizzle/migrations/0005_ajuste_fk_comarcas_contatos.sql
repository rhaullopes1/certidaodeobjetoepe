ALTER TABLE public.comarcas_contatos
  DROP CONSTRAINT IF EXISTS comarcas_contatos_pedido_fk;

ALTER TABLE public.pedido_andamentos
  ADD CONSTRAINT pedido_andamentos_comarca_contato_fk
  FOREIGN KEY (comarca_contato_id) REFERENCES public.comarcas_contatos(id) ON DELETE SET NULL;
